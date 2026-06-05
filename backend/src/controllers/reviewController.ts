import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { shouldReportAllergy, calculateTrustIndex } from '../utils/trustIndex';

const prisma = new PrismaClient();

// 创建评价
export const createReview = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      childAge,
      skinType,
      rating,
      content,
      hasAllergy,
      allergySymptoms,
      usageDuration
    } = req.body;

    if (!productId || !childAge || !skinType || !rating || !content) {
      return res.status(400).json({ error: '请填写完整的评价信息' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }

    const symptoms = Array.isArray(allergySymptoms) ? allergySymptoms : [];
    const needReport = hasAllergy && shouldReportAllergy(symptoms);

    const review = await prisma.review.create({
      data: {
        productId: parseInt(productId),
        childAge: parseInt(childAge),
        skinType,
        rating: parseInt(rating),
        content,
        hasAllergy: !!hasAllergy,
        allergySymptoms: symptoms.length > 0 ? JSON.stringify(symptoms) : null,
        usageDuration: usageDuration || null
      }
    });

    // 重新计算产品的放心指数
    const productWithRelations = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        brand: true,
        reviews: true,
        adverseReactions: true,
        inspectionResults: true,
        blacklist: true
      }
    });

    if (productWithRelations) {
      const newTrustIndex = calculateTrustIndex({ product: productWithRelations as any });
      await prisma.product.update({
        where: { id: parseInt(productId) },
        data: { trustIndex: newTrustIndex }
      });
    }

    res.json({
      success: true,
      data: {
        ...review,
        allergySymptoms: symptoms,
        needReport,
        reportTip: needReport ? '您描述的过敏症状较为严重，建议及时就医并向当地药品监督管理部门上报不良反应。' : null
      }
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    res.status(500).json({ error: '评价提交失败，请稍后重试' });
  }
};

// 获取我的评价列表
export const getMyReviews = async (_req: Request, res: Response) => {
  try {
    // 简化版本：返回所有评价（实际项目中应该根据用户ID过滤）
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          include: {
            brand: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const result = reviews.map(review => ({
      ...review,
      allergySymptoms: review.allergySymptoms ? JSON.parse(review.allergySymptoms) : [],
      product: {
        ...review.product,
        ingredients: JSON.parse(review.product.ingredients || '[]'),
        highAllergenIngredients: JSON.parse(review.product.highAllergenIngredients || '[]')
      }
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    res.status(500).json({ error: '获取评价列表失败' });
  }
};

// 获取产品的评价列表
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const result = reviews.map(review => ({
      ...review,
      allergySymptoms: review.allergySymptoms ? JSON.parse(review.allergySymptoms) : []
    }));

    // 统计数据
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '0';
    const allergyCount = reviews.filter(r => r.hasAllergy).length;

    res.json({
      success: true,
      data: result,
      stats: {
        totalReviews,
        avgRating,
        allergyCount,
        allergyRate: totalReviews > 0 ? ((allergyCount / totalReviews) * 100).toFixed(1) : '0'
      }
    });
  } catch (error) {
    console.error('获取产品评价失败:', error);
    res.status(500).json({ error: '获取产品评价失败' });
  }
};
