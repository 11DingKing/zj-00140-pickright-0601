import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getTrustLevel } from "../utils/trustIndex";
import { checkProductAllergens } from "../utils/allergen";

const prisma = new PrismaClient();

// 搜索产品（按产品名或备案号）
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { keyword, category, usePersonalization } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "请输入搜索关键词" });
    }

    const keywordStr = String(keyword);
    const where: any = {
      OR: [
        { name: { contains: keywordStr } },
        { recordNumber: { contains: keywordStr } },
        { brand: { name: { contains: keywordStr } } },
      ],
    };

    if (category && typeof category === "string") {
      where.category = category;
    }

    const parentId = parseInt(req.headers["x-parent-id"] as string) || 1;

    let allergenProfiles: any[] = [];
    if (usePersonalization !== false && usePersonalization !== "false") {
      allergenProfiles = await prisma.allergenProfile.findMany({
        where: { parentId },
      });
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
        adverseReactions: true,
        inspectionResults: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { trustIndex: "desc" },
      take: 50,
    });

    // 处理返回数据，添加放心等级信息和过敏原检测
    const result = products.map((product) => {
      const trustLevel = getTrustLevel(product.trustIndex);
      const isBlacklisted = !!product.blacklist || !!product.brand.blacklist;

      let allergenInfo = null;
      if (allergenProfiles.length > 0) {
        allergenInfo = checkProductAllergens(product, allergenProfiles);
      }

      return {
        ...product,
        ingredients: JSON.parse(product.ingredients || "[]"),
        highAllergenIngredients: JSON.parse(
          product.highAllergenIngredients || "[]",
        ),
        trustLevel,
        isBlacklisted,
        reviewCount: product._count.reviews,
        allergenInfo,
      };
    });

    // 按照过敏原警告排序：有过敏原警告的排在后面，严重的排在最后
    result.sort((a, b) => {
      const aHasAllergen = a.allergenInfo?.hasAllergen ? 1 : 0;
      const bHasAllergen = b.allergenInfo?.hasAllergen ? 1 : 0;

      if (aHasAllergen !== bHasAllergen) {
        return aHasAllergen - bHasAllergen;
      }

      if (aHasAllergen && bHasAllergen) {
        const aHasSevere = a.allergenInfo?.matchedAllergens.some(
          (x: any) => x.severity === "严重",
        )
          ? 1
          : 0;
        const bHasSevere = b.allergenInfo?.matchedAllergens.some(
          (x: any) => x.severity === "严重",
        )
          ? 1
          : 0;
        if (aHasSevere !== bHasSevere) {
          return aHasSevere - bHasSevere;
        }
      }

      return b.trustIndex - a.trustIndex;
    });

    const allergenWarningCount = result.filter(
      (p: any) => p.allergenInfo?.hasAllergen,
    ).length;

    res.json({
      success: true,
      data: result,
      total: result.length,
      stats: {
        allergenWarningCount,
        userAllergenCount: allergenProfiles.length,
      },
    });
  } catch (error) {
    console.error("搜索产品失败:", error);
    res.status(500).json({ error: "搜索失败，请稍后重试" });
  }
};

// 获取产品详情
export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parentId = parseInt(req.headers["x-parent-id"] as string) || 1;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        brand: {
          include: {
            blacklist: true,
          },
        },
        blacklist: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        adverseReactions: {
          orderBy: { reportDate: "desc" },
        },
        inspectionResults: {
          orderBy: { inspectionDate: "desc" },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "产品不存在" });
    }

    const trustLevel = getTrustLevel(product.trustIndex);
    const isBlacklisted = !!product.blacklist || !!product.brand.blacklist;

    // 统计过敏率
    const totalReviews = product.reviews.length;
    const allergyReviews = product.reviews.filter((r) => r.hasAllergy).length;
    const allergyRate =
      totalReviews > 0
        ? ((allergyReviews / totalReviews) * 100).toFixed(1)
        : "0";

    // 获取用户过敏原档案并检测
    const allergenProfiles = await prisma.allergenProfile.findMany({
      where: { parentId },
    });
    const allergenInfo =
      allergenProfiles.length > 0
        ? checkProductAllergens(product, allergenProfiles)
        : null;

    // 检查订阅状态
    const subscription = await prisma.productSubscription.findUnique({
      where: {
        parentId_productId: {
          parentId,
          productId: parseInt(id),
        },
      },
    });

    const result = {
      ...product,
      ingredients: JSON.parse(product.ingredients || "[]"),
      highAllergenIngredients: JSON.parse(
        product.highAllergenIngredients || "[]",
      ),
      reviews: product.reviews.map((r) => ({
        ...r,
        allergySymptoms: r.allergySymptoms ? JSON.parse(r.allergySymptoms) : [],
      })),
      trustLevel,
      isBlacklisted,
      allergyRate,
      totalReviews,
      allergyReviews,
      allergenInfo,
      isSubscribed: subscription?.isActive || false,
      subscription: subscription || null,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("获取产品详情失败:", error);
    res.status(500).json({ error: "获取产品详情失败" });
  }
};

// 获取产品分类
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      _count: true,
    });

    res.json({
      success: true,
      data: categories.map((c) => ({
        name: c.category,
        count: c._count,
      })),
    });
  } catch (error) {
    console.error("获取分类失败:", error);
    res.status(500).json({ error: "获取分类失败" });
  }
};
