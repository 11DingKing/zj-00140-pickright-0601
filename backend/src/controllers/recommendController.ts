import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRecommendations } from '../utils/recommend';
import { getTrustLevel } from '../utils/trustIndex';

const prisma = new PrismaClient();

// 获取推荐产品
export const getRecommendedProducts = async (req: Request, res: Response) => {
  try {
    const params = { ...req.query, ...req.body };
    const { childAge, skinType, category, excludeHighAllergen, age: ageParam } = params;

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
        blacklist: true
      }
    });

    // 计算推荐结果
    const recommendations = getRecommendations(products, {
      childAge: age,
      skinType,
      category: category || undefined,
      excludeHighAllergen: excludeHighAllergen === true || excludeHighAllergen === 'true'
    });

    // 格式化返回数据
    const result = recommendations.map(item => ({
      ...item.product,
      ingredients: JSON.parse(item.product.ingredients || '[]'),
      highAllergenIngredients: JSON.parse(item.product.highAllergenIngredients || '[]'),
      trustLevel: getTrustLevel(item.product.trustIndex),
      matchScore: Math.round(item.matchScore)
    }));

    res.json({
      success: true,
      data: result,
      params: {
        childAge: age,
        skinType,
        category: category || null,
        excludeHighAllergen: excludeHighAllergen === true || excludeHighAllergen === 'true'
      }
    });
  } catch (error) {
    console.error('获取推荐失败:', error);
    res.status(500).json({ error: '获取推荐失败，请稍后重试' });
  }
};
