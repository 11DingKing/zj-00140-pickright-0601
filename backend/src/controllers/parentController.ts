import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getCurrentParent = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        allergenProfiles: true,
        subscriptions: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ error: "用户不存在" });
    }

    const unreadCount = parent.notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        ...parent,
        unreadNotificationCount: unreadCount,
      },
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({ error: "获取用户信息失败" });
  }
};

export const updateParent = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { name, childName, childAge, skinType } = req.body;

    if (childAge !== undefined && (childAge < 0 || childAge > 18)) {
      return res.status(400).json({ error: "孩子年龄必须在0-18岁之间" });
    }

    const validSkinTypes = ["normal", "dry", "oily", "sensitive"];
    if (skinType && !validSkinTypes.includes(skinType)) {
      return res.status(400).json({ error: "无效的肤质类型" });
    }

    const parent = await prisma.parent.update({
      where: { id: parentId },
      data: {
        name,
        childName,
        childAge,
        skinType,
      },
    });

    res.json({
      success: true,
      data: parent,
    });
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({ error: "更新用户信息失败" });
  }
};

export const addAllergenProfile = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { allergenType, allergenName, severity, description } = req.body;

    if (!allergenType || !allergenName || !severity) {
      return res.status(400).json({ error: "请填写完整的过敏原信息" });
    }

    const validTypes = ['香精', '着色剂', '防腐剂', '酒精', '矿物油', '羊毛脂', '棕榈酸', '硬脂酸', '其他'];
    if (!validTypes.includes(allergenType)) {
      return res.status(400).json({ error: "无效的过敏原类型" });
    }

    const validSeverities = ['轻微', '中度', '严重'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: "无效的严重程度" });
    }

    const profile = await prisma.allergenProfile.create({
      data: {
        parentId,
        allergenType,
        allergenName,
        severity,
        description,
      },
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("添加过敏原档案失败:", error);
    res.status(500).json({ error: "添加过敏原档案失败" });
  }
};

export const updateAllergenProfile = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { id } = req.params;
    const { allergenType, allergenName, severity, description } = req.body;

    const profile = await prisma.allergenProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!profile) {
      return res.status(404).json({ error: "过敏原档案不存在" });
    }

    if (profile.parentId !== parentId) {
      return res.status(403).json({ error: "无权限修改此档案" });
    }

    const updated = await prisma.allergenProfile.update({
      where: { id: parseInt(id) },
      data: {
        allergenType,
        allergenName,
        severity,
        description,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("更新过敏原档案失败:", error);
    res.status(500).json({ error: "更新过敏原档案失败" });
  }
};

export const deleteAllergenProfile = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { id } = req.params;

    const profile = await prisma.allergenProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!profile) {
      return res.status(404).json({ error: "过敏原档案不存在" });
    }

    if (profile.parentId !== parentId) {
      return res.status(403).json({ error: "无权限删除此档案" });
    }

    await prisma.allergenProfile.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除过敏原档案失败:", error);
    res.status(500).json({ error: "删除过敏原档案失败" });
  }
};

export const getAllergenProfiles = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;

    const profiles = await prisma.allergenProfile.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("获取过敏原档案失败:", error);
    res.status(500).json({ error: "获取过敏原档案失败" });
  }
};
