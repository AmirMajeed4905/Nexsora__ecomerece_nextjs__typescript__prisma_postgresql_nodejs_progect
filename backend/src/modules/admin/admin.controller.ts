import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess } from "../../utils/response.utils";

// ── GET /api/admin/stats ───────────────────────────────────────
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    revenueResult,
    pendingOrders,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: "asc" },
      include: { category: { select: { name: true } } },
    }),
  ]);

  sendSuccess(res, 200, "Stats fetched", {
    stats: {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue: parseFloat((revenueResult._sum.total ?? 0).toFixed(2)),
      pendingOrders,
    },
    recentOrders,
    lowStockProducts,
  });
};