import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getTrustLevel, calculateTrustIndex, isBlacklistedProduct } from '../utils/trustIndex';

// 获取白名单（放心榜）
export const getWhitelist = async (_req: Request, res: Response) => {
  try {
    const whitelist = await prisma.whitelist.findMany({
      include: {
        brand: {
          include: {
            blacklist: true,
            products: {
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
                _count: { select: { reviews: true } },
              },
            },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    const result = whitelist.map((item) => ({
      ...item,
      brand: {
        ...item.brand,
        products: item.brand.products
          .filter((p) => p.isRegistered && !isBlacklistedProduct(p as any))
          .slice(0, 5)
          .map((p) => {
            const calculatedTrustIndex = calculateTrustIndex({
              product: p as any,
            });
            return {
              ...p,
              ingredients: JSON.parse(p.ingredients || '[]'),
              highAllergenIngredients: JSON.parse(p.highAllergenIngredients || '[]'),
              trustIndex: calculatedTrustIndex,
              trustLevel: getTrustLevel(calculatedTrustIndex),
              isBlacklisted: isBlacklistedProduct(p as any),
              reviewCount: p._count.reviews,
            };
          }),
      },
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取白名单失败:', error);
    res.status(500).json({ error: '获取白名单失败' });
  }
};

// 获取黑名单
export const getBlacklist = async (_req: Request, res: Response) => {
  try {
    const blacklist = await prisma.blacklist.findMany({
      where: { isActive: true },
      include: {
        brand: true,
        product: {
          include: { brand: true },
        },
      },
      orderBy: { penaltyDate: 'desc' },
    });

    const result = blacklist.map((item) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            ingredients: JSON.parse(item.product.ingredients || '[]'),
            highAllergenIngredients: JSON.parse(item.product.highAllergenIngredients || '[]'),
          }
        : null,
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取黑名单失败:', error);
    res.status(500).json({ error: '获取黑名单失败' });
  }
};

// 获取放心榜（按放心指数排序的产品榜单）
export const getTrustRank = async (req: Request, res: Response) => {
  try {
    const { category, limit = '20' } = req.query;

    const where: any = {
      isRegistered: true,
    };

    if (category && typeof category === 'string') {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
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
        _count: { select: { reviews: true } },
      },
      take: 100,
    });

    // 先过滤掉黑名单产品，再实时计算放心指数，然后排序
    const validProducts = products.filter((p) => !isBlacklistedProduct(p as any));

    const productsWithTrustIndex = validProducts.map((product) => {
      const calculatedTrustIndex = calculateTrustIndex({
        product: product as any,
      });
      return {
        ...product,
        calculatedTrustIndex,
        reviewCount: product._count.reviews,
      };
    });

    // 按实时计算的放心指数降序排序
    productsWithTrustIndex.sort((a, b) => b.calculatedTrustIndex - a.calculatedTrustIndex);

    // 取前 N 个
    const limitedProducts = productsWithTrustIndex.slice(0, parseInt(limit as string));

    const result = limitedProducts.map((product, index) => {
      const trustLevel = getTrustLevel(product.calculatedTrustIndex);
      return {
        rank: index + 1,
        ...product,
        ingredients: JSON.parse(product.ingredients || '[]'),
        highAllergenIngredients: JSON.parse(product.highAllergenIngredients || '[]'),
        trustIndex: product.calculatedTrustIndex,
        trustLevel,
        isBlacklisted: false,
        reviewCount: product.reviewCount,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取放心榜失败:', error);
    res.status(500).json({ error: '获取放心榜失败' });
  }
};
