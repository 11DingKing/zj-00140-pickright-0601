// 放心指数计算工具

import type { Product, Review, AdverseReaction, InspectionResult, Blacklist } from '@prisma/client';

interface CalculateTrustIndexParams {
  product: Product & {
    brand: { isWhitelist: boolean; blacklist: Blacklist | null };
    reviews: Review[];
    adverseReactions: AdverseReaction[];
    inspectionResults: InspectionResult[];
    blacklist: Blacklist | null;
  };
}

// 计算综合放心指数 (0-10分)
export function calculateTrustIndex({ product }: CalculateTrustIndexParams): number {
  let score = 0;
  const maxScore = 100;

  // 1. 基础安全分 (权重40%)
  score += (product.safetyScore / 100) * 40;

  // 2. 是否在册 (权重10%) - 不在册直接大幅扣分
  if (product.isRegistered) {
    score += 10;
  } else {
    score -= 20;
  }

  // 3. 是否在黑名单 (一票否决)
  if (product.blacklist || product.brand.blacklist) {
    return 0;
  }

  // 4. 品牌是否在白名单 (权重10%)
  if (product.brand.isWhitelist) {
    score += 10;
  }

  // 5. 是否极简配方 (权重10%)
  if (product.isMinimalFormula) {
    score += 10;
  }

  // 6. 高致敏成分 (权重10%) - 成分越少越好
  const highAllergens = JSON.parse(product.highAllergenIngredients || '[]');
  if (highAllergens.length === 0) {
    score += 10;
  } else if (highAllergens.length <= 2) {
    score += 5;
  } else if (highAllergens.length <= 5) {
    score += 2;
  } else {
    score -= 5;
  }

  // 7. 用户评价 (权重10%)
  if (product.reviews.length > 0) {
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    score += (avgRating / 5) * 10;

    // 过敏反馈扣分
    const allergyCount = product.reviews.filter(r => r.hasAllergy).length;
    const allergyRate = allergyCount / product.reviews.length;
    if (allergyRate > 0.3) {
      score -= 15;
    } else if (allergyRate > 0.1) {
      score -= 8;
    }
  } else {
    score += 5; // 无评价时给一半分
  }

  // 8. 不良反应通报 (权重-10到0)
  if (product.adverseReactions.length > 0) {
    const severeCount = product.adverseReactions.filter(r => r.severity === '严重').length;
    score -= severeCount * 8;
    score -= (product.adverseReactions.length - severeCount) * 3;
  }

  // 9. 抽检不合格 (权重-10到0)
  const failedInspections = product.inspectionResults.filter(r => r.result === '不合格');
  if (failedInspections.length > 0) {
    score -= failedInspections.length * 10;
  }

  // 转换为0-10分制
  const finalScore = Math.max(0, Math.min(10, score / 10));
  return Math.round(finalScore * 10) / 10;
}

// 获取放心指数等级描述
export function getTrustLevel(trustIndex: number): { level: string; color: string; description: string } {
  if (trustIndex >= 9) {
    return { level: '非常放心', color: '#52c41a', description: '该产品安全可靠，强烈推荐' };
  } else if (trustIndex >= 7.5) {
    return { level: '比较放心', color: '#73d13d', description: '该产品整体安全，可放心使用' };
  } else if (trustIndex >= 6) {
    return { level: '谨慎使用', color: '#faad14', description: '该产品存在一定风险，建议谨慎选择' };
  } else if (trustIndex >= 4) {
    return { level: '不推荐', color: '#fa8c16', description: '该产品风险较高，不建议儿童使用' };
  } else {
    return { level: '危险', color: '#ff4d4f', description: '该产品存在严重安全问题，禁止使用' };
  }
}

// 检查是否需要提示上报过敏
export function shouldReportAllergy(symptoms: string[]): boolean {
  const severeSymptoms = [
    '呼吸困难', '喉头水肿', '过敏性休克', '意识丧失',
    '严重红肿', '大面积皮疹', '水疱', '溃烂'
  ];
  return symptoms.some(s => severeSymptoms.some(severe => s.includes(severe)));
}
