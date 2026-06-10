import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getRecommendations } from '../utils/recommend';
import { getTrustLevel, calculateTrustIndex, isBlacklistedProduct } from '../utils/trustIndex';

// 获取推荐产品
export const getRecommendedProducts = async (req: Request, res: Response) => {
  try {
    const params = { ...req.query, ...req.body };
    const {
      childAge,
      skinType,
      category,
      excludeHighAllergen,
      excludeAllergenProducts,
      age: ageParam,
      usePersonalization,
    } = params;

    const actualAge = childAge || ageParam;

    if (!actualAge || !skinType) {
      return res.status(400).json({ error: '请填写孩子年龄和肤质' });
    }

    const age = parseInt(String(actualAge));
    if (isNaN(age) || age < 0 || age > 18) {
      return res.status(400).json({ error: '请输入有效的年龄（0-18岁）' });
    }

    const validSkinTypes = ['normal', 'dry', 'oily', 'sensitive'];
    if (!validSkinTypes.includes(skinType)) {
      return res.status(400).json({ error: '请选择有效的肤质类型' });
    }

    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;

    let allergenProfiles: any[] = [];
    if (usePersonalization !== false && usePersonalization !== 'false') {
      allergenProfiles = await prisma.allergenProfile.findMany({
        where: { parentId },
      });
    }

    // 获取所有合规产品
    const products = await prisma.product.findMany({
      where: {
        isRegistered: true,
        blacklist: null,
        brand: {
          blacklist: null
        }
      },
      include: {
        brand: {
          include: {
            blacklist: true,
            whitelist: true
          }
        },
        blacklist: true,
        reviews: true,
        adverseReactions: true,
        inspectionResults: true,
      },
    });

    // 计算推荐结果
    const recommendations = getRecommendations(products, {
      childAge: age,
      skinType,
      category: category || undefined,
      excludeHighAllergen: excludeHighAllergen === true || excludeHighAllergen === 'true',
      allergenProfiles,
      excludeAllergenProducts:
        excludeAllergenProducts === true || excludeAllergenProducts === 'true',
    });

    // 统计过滤信息
    const totalProducts = products.length;
    const filteredCount = totalProducts - recommendations.length;
    const allergenFilteredCount = recommendations.filter(
      (r) => r.product.allergenInfo?.hasAllergen,
    ).length;

    // 格式化返回数据，实时计算放心指数
    const result = recommendations.map((item) => {
      const calculatedTrustIndex = calculateTrustIndex({
        product: item.product as any,
      });
      return {
        ...item.product,
        ingredients: JSON.parse(item.product.ingredients || '[]'),
        highAllergenIngredients: JSON.parse(item.product.highAllergenIngredients || '[]'),
        trustIndex: calculatedTrustIndex,
        trustLevel: getTrustLevel(calculatedTrustIndex),
        isBlacklisted: isBlacklistedProduct(item.product as any),
        matchScore: Math.round(item.matchScore),
        reviewCount: (item.product as any).reviews?.length || 0,
        allergenInfo: item.product.allergenInfo,
      };
    });

    res.json({
      success: true,
      data: result,
      params: {
        childAge: age,
        skinType,
        category: category || null,
        excludeHighAllergen: excludeHighAllergen === true || excludeHighAllergen === 'true',
        excludeAllergenProducts:
          excludeAllergenProducts === true || excludeAllergenProducts === 'true',
        usePersonalization: usePersonalization !== false && usePersonalization !== 'false',
      },
      stats: {
        totalProducts,
        returnedCount: result.length,
        filteredCount,
        allergenFilteredCount,
        userAllergenCount: allergenProfiles.length,
      },
    });
  } catch (error) {
    console.error('获取推荐失败:', error);
    res.status(500).json({ error: '获取推荐失败，请稍后重试' });
  }
};
