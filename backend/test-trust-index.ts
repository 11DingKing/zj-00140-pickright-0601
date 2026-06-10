import prisma from './src/utils/prisma';
import { calculateTrustIndex, getTrustLevel } from './src/utils/trustIndex';

async function testTrustIndexCalculation() {
  console.log('🧪 测试放心指数计算逻辑\n');

  // 获取所有产品及其关联数据
  const products = await prisma.product.findMany({
    include: {
      brand: {
        include: {
          blacklist: true,
        },
      },
      blacklist: true,
      reviews: true,
      adverseReactions: true,
      inspectionResults: true,
    },
  });

  console.log(`📊 共找到 ${products.length} 个产品\n`);
  console.log('━'.repeat(80));

  for (const product of products) {
    const calculatedTrustIndex = calculateTrustIndex({ product: product as any });
    const trustLevel = getTrustLevel(calculatedTrustIndex);
    const isBlacklisted = !!product.blacklist || !!product.brand.blacklist;
    const hasAdverseReactions = product.adverseReactions.length > 0;
    const hasFailedInspections = product.inspectionResults.some((r) => r.result === '不合格');
    const hasAllergyReviews = product.reviews.some((r) => r.hasAllergy);

    console.log(`\n📦 产品: ${product.name}`);
    console.log(`   备案号: ${product.recordNumber}`);
    console.log(`   品牌: ${product.brand.name}`);
    console.log(`   黑名单: ${isBlacklisted ? '❌ 是' : '✅ 否'}`);
    console.log(`   基础安全分: ${product.safetyScore}`);
    console.log(
      `   不良反应通报: ${hasAdverseReactions ? `⚠️ ${product.adverseReactions.length}条` : '✅ 无'}`,
    );
    console.log(
      `   抽检不合格: ${hasFailedInspections ? `❌ ${product.inspectionResults.filter((r) => r.result === '不合格').length}次` : '✅ 无'}`,
    );
    console.log(
      `   过敏反馈: ${hasAllergyReviews ? `⚠️ ${product.reviews.filter((r) => r.hasAllergy).length}条` : '✅ 无'}`,
    );
    console.log(`   计算放心指数: ${calculatedTrustIndex.toFixed(1)}`);
    console.log(`   放心等级: ${trustLevel.level} (${trustLevel.color})`);
    console.log(`   描述: ${trustLevel.description}`);

    // 验证黑名单产品
    if (isBlacklisted && calculatedTrustIndex !== 0) {
      console.log(`   ❌ 错误: 黑名单产品放心指数应该为0，但实际为 ${calculatedTrustIndex}`);
    }

    // 验证有严重问题的产品
    if (hasFailedInspections && calculatedTrustIndex > 4) {
      console.log(`   ⚠️  警告: 有抽检不合格记录的产品放心指数应该较低`);
    }

    if (hasAdverseReactions && calculatedTrustIndex > 5) {
      console.log(`   ⚠️  警告: 有不良反应通报的产品放心指数应该较低`);
    }
  }

  console.log('\n' + '━'.repeat(80));
  console.log('\n✅ 测试完成！');

  await prisma.$disconnect();
}

testTrustIndexCalculation().catch(console.error);
