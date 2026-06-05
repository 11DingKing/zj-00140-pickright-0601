import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getTrustLevel } from '../utils/trustIndex';

const prisma = new PrismaClient();

// 获取白名单（放心榜）
export const getWhitelist = async (_req: Request, res: Response) => {
  try {
    const whitelist = await prisma.whitelist.findMany({
      include: {
        brand: {
          include: {
            products: {
              include: {
                blacklist: true,
                _count: { select: { reviews: true } }
              }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    const result = whitelist.map(item => ({
      ...item,
      brand: {
        ...item.brand,
        products: item.brand.products
          .filter(p => p.isRegistered && !p.blacklist)
          .slice(0, 5)
          .map(p => ({
            ...p,
            ingredients: JSON.parse(p.ingredients || '[]'),
            highAllergenIngredients: JSON.parse(p.highAllergenIngredients || '[]'),
            trustLevel: getTrustLevel(p.trustIndex),
            reviewCount: p._count.reviews
          }))
      }
    }));

    res.json({
      success: true,
      data: result
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
          include: { brand: true }
        }
      },
      orderBy: { penaltyDate: 'desc' }
    });

    const result = blacklist.map(item => ({
      ...item,
      product: item.product ? {
        ...item.product,
        ingredients: JSON.parse(item.product.ingredients || '[]'),
        highAllergenIngredients: JSON.parse(item.product.highAllergenIngredients || '[]')
      } : null
    }));

    res.json({
      success: true,
      data: result
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
      blacklist: null,
      brand: {
        blacklist: null
      }
    };

    if (category && typeof category === 'string') {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        _count: { select: { reviews: true } }
      },
      orderBy: { trustIndex: 'desc' },
      take: parseInt(limit as string)
    });

    const result = products.map((product, index) => {
      const trustLevel = getTrustLevel(product.trustIndex);
      return {
        rank: index + 1,
        ...product,
        ingredients: JSON.parse(product.ingredients || '[]'),
        highAllergenIngredients: JSON.parse(product.highAllergenIngredients || '[]'),
        trustLevel,
        reviewCount: product._count.reviews
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取放心榜失败:', error);
    res.status(500).json({ error: '获取放心榜失败' });
  }
};
