import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;

    const subscriptions = await prisma.productSubscription.findMany({
      where: { parentId, isActive: true },
      include: {
        product: {
          include: {
            brand: true,
            adverseReactions: {
              orderBy: { reportDate: 'desc' },
              take: 3,
            },
            inspectionResults: {
              orderBy: { inspectionDate: 'desc' },
              take: 3,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: subscriptions.map((sub) => ({
        ...sub,
        product: {
          ...sub.product,
          ingredients: JSON.parse(sub.product.ingredients || '[]'),
          highAllergenIngredients: JSON.parse(sub.product.highAllergenIngredients || '[]'),
        },
      })),
    });
  } catch (error) {
    console.error('获取订阅列表失败:', error);
    res.status(500).json({ error: '获取订阅列表失败' });
  }
};

export const addSubscription = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { productId, notifyOnAdverseReaction = true, notifyOnInspection = true } = req.body;

    if (!productId) {
      return res.status(400).json({ error: '请提供产品ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }

    const existing = await prisma.productSubscription.findUnique({
      where: {
        parentId_productId: {
          parentId,
          productId: parseInt(productId),
        },
      },
    });

    if (existing) {
      if (!existing.isActive) {
        const updated = await prisma.productSubscription.update({
          where: { id: existing.id },
          data: { isActive: true, notifyOnAdverseReaction, notifyOnInspection },
        });
        return res.json({
          success: true,
          data: updated,
          message: '已重新订阅',
        });
      }
      return res.status(400).json({ error: '已经订阅了该产品' });
    }

    const subscription = await prisma.productSubscription.create({
      data: {
        parentId,
        productId: parseInt(productId),
        notifyOnAdverseReaction,
        notifyOnInspection,
      },
    });

    res.json({
      success: true,
      data: subscription,
      message: '订阅成功',
    });
  } catch (error) {
    console.error('添加订阅失败:', error);
    res.status(500).json({ error: '订阅失败' });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { id } = req.params;
    const { notifyOnAdverseReaction, notifyOnInspection } = req.body;

    const subscription = await prisma.productSubscription.findUnique({
      where: { id: parseInt(id) },
    });

    if (!subscription) {
      return res.status(404).json({ error: '订阅不存在' });
    }

    if (subscription.parentId !== parentId) {
      return res.status(403).json({ error: '无权限修改此订阅' });
    }

    const updated = await prisma.productSubscription.update({
      where: { id: parseInt(id) },
      data: {
        notifyOnAdverseReaction,
        notifyOnInspection,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('更新订阅失败:', error);
    res.status(500).json({ error: '更新订阅失败' });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { id } = req.params;

    const subscription = await prisma.productSubscription.findUnique({
      where: { id: parseInt(id) },
    });

    if (!subscription) {
      return res.status(404).json({ error: '订阅不存在' });
    }

    if (subscription.parentId !== parentId) {
      return res.status(403).json({ error: '无权限取消此订阅' });
    }

    await prisma.productSubscription.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: '已取消订阅',
    });
  } catch (error) {
    console.error('取消订阅失败:', error);
    res.status(500).json({ error: '取消订阅失败' });
  }
};

export const checkSubscription = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { productId } = req.params;

    const subscription = await prisma.productSubscription.findUnique({
      where: {
        parentId_productId: {
          parentId,
          productId: parseInt(productId),
        },
      },
    });

    res.json({
      success: true,
      data: {
        isSubscribed: subscription?.isActive || false,
        subscription: subscription || null,
      },
    });
  } catch (error) {
    console.error('检查订阅状态失败:', error);
    res.status(500).json({ error: '检查订阅状态失败' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { unreadOnly } = req.query;

    const where: any = { parentId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({ error: '获取通知列表失败' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      return res.status(404).json({ error: '通知不存在' });
    }

    if (notification.parentId !== parentId) {
      return res.status(403).json({ error: '无权限操作此通知' });
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: '已标记为已读',
    });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;

    await prisma.notification.updateMany({
      where: { parentId, isRead: false },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: '已全部标记为已读',
    });
  } catch (error) {
    console.error('标记全部已读失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const parentId = parseInt(req.headers['x-parent-id'] as string) || 1;

    const count = await prisma.notification.count({
      where: { parentId, isRead: false },
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('获取未读数量失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
};
