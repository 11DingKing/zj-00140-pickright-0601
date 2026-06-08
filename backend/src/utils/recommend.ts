// 产品推荐算法

import type {
  Product,
  Brand,
  Blacklist,
  AllergenProfile,
} from "@prisma/client";
import { checkProductAllergens, type AllergenMatchResult } from "./allergen";

interface RecommendParams {
  childAge: number;
  skinType: string;
  category?: string;
  excludeHighAllergen?: boolean;
  allergenProfiles?: AllergenProfile[];
  excludeAllergenProducts?: boolean;
}

interface ProductWithBrand extends Product {
  brand: Brand & {
    blacklist: Blacklist | null;
    whitelist?: any;
  };
  blacklist: Blacklist | null;
}

export interface ProductWithAllergenInfo extends ProductWithBrand {
  allergenInfo?: AllergenMatchResult;
}

export interface ScoredProduct {
  product: ProductWithAllergenInfo;
  matchScore: number;
}

// 计算产品匹配度得分 (0-100)
function calculateMatchScore(
  product: ProductWithAllergenInfo,
  params: RecommendParams,
): number {
  let score = 0;

  // 1. 年龄匹配 (权重40%)
  if (params.childAge >= product.minAge && params.childAge <= product.maxAge) {
    score += 40;
  } else {
    // 年龄不匹配但接近
    const ageDiff = Math.min(
      Math.abs(params.childAge - product.minAge),
      Math.abs(params.childAge - product.maxAge),
    );
    if (ageDiff <= 1) {
      score += 20;
    } else if (ageDiff <= 2) {
      score += 10;
    }
  }

  // 2. 肤质匹配 (权重30%)
  const highAllergens = JSON.parse(product.highAllergenIngredients || "[]");

  if (params.skinType === "sensitive") {
    // 敏感肌优先选择无高致敏成分、极简配方的产品
    if (highAllergens.length === 0) {
      score += 30;
    } else if (highAllergens.length <= 2) {
      score += 15;
    } else {
      score += 5;
    }
    if (product.isMinimalFormula) {
      score += 10; // 额外加分
    }
  } else if (params.skinType === "dry") {
    // 干性肌肤 - 检查是否有保湿成分
    const ingredients = JSON.parse(product.ingredients || "[]");
    const moisturizingIngredients = [
      "甘油",
      "透明质酸",
      "神经酰胺",
      "角鲨烷",
      "维生素E",
    ];
    const hasMoisturizing = ingredients.some((i: string) =>
      moisturizingIngredients.some((m) => i.includes(m)),
    );
    score += hasMoisturizing ? 30 : 20;
  } else if (params.skinType === "oily") {
    // 油性肌肤 - 检查是否无致痘成分
    const comedogenicIngredients = ["棕榈酸", "硬脂酸", "羊毛脂", "矿物油"];
    const hasComedogenic = highAllergens.some((i: string) =>
      comedogenicIngredients.some((c) => i.includes(c)),
    );
    score += hasComedogenic ? 15 : 30;
  } else {
    // 普通肤质
    score += 25;
  }

  // 3. 排除高致敏成分选项 (权重-20到0)
  if (params.excludeHighAllergen && highAllergens.length > 0) {
    score -= Math.min(20, highAllergens.length * 5);
  }

  // 4. 品类匹配 (权重10%)
  if (params.category && product.category === params.category) {
    score += 10;
  } else if (!params.category) {
    score += 5;
  }

  // 5. 安全分加成 (权重20%)
  score += (product.trustIndex / 10) * 20;

  // 6. 白名单品牌加分
  if (product.brand.isWhitelist) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

// 获取推荐产品列表
export function getRecommendations(
  products: ProductWithBrand[],
  params: RecommendParams,
): ScoredProduct[] {
  // 过滤掉不在册、黑名单产品
  const validProducts = products.filter(
    (p) => p.isRegistered && !p.blacklist && !p.brand.blacklist,
  );

  // 添加过敏原检测信息
  const productsWithAllergenInfo: ProductWithAllergenInfo[] = validProducts.map(
    (product) => {
      if (params.allergenProfiles && params.allergenProfiles.length > 0) {
        const allergenInfo = checkProductAllergens(
          product,
          params.allergenProfiles,
        );
        return { ...product, allergenInfo };
      }
      return product;
    },
  );

  // 计算匹配度并排序
  const scored = productsWithAllergenInfo.map((product) => {
    let matchScore = calculateMatchScore(product, params);

    // 过敏原惩罚：如果产品含有用户过敏原，大幅降低匹配度
    if (product.allergenInfo?.hasAllergen) {
      const hasSevereAllergen = product.allergenInfo.matchedAllergens.some(
        (a) => a.severity === "严重",
      );
      const hasModerateAllergen = product.allergenInfo.matchedAllergens.some(
        (a) => a.severity === "中度",
      );

      if (hasSevereAllergen) {
        matchScore = Math.max(0, matchScore - 50);
      } else if (hasModerateAllergen) {
        matchScore = Math.max(0, matchScore - 30);
      } else {
        matchScore = Math.max(0, matchScore - 15);
      }
    }

    return {
      product,
      matchScore,
    };
  });

  // 如果需要排除过敏原产品，在排序前过滤
  let filteredScored = scored;
  if (
    params.allergenProfiles &&
    params.allergenProfiles.length > 0 &&
    params.excludeAllergenProducts
  ) {
    filteredScored = scored.filter(
      (item) => !item.product.allergenInfo?.hasAllergen,
    );
  }

  // 按匹配度降序，相同匹配度按放心指数降序
  filteredScored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return b.product.trustIndex - a.product.trustIndex;
  });

  // 返回前20个结果
  return filteredScored.slice(0, 20);
}
