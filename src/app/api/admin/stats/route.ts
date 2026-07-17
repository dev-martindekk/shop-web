import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";
import { SOLD_STATUSES } from "@/lib/product-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const paidFilter = { status: { in: [...SOLD_STATUSES] } };

    const [revenueAgg, totalOrders, pendingVerify, totalCustomers, totalProducts, recentOrders] =
      await Promise.all([
        db.order.aggregate({ where: paidFilter, _sum: { total: true } }),
        db.order.count(),
        db.order.count({ where: { status: "PENDING_VERIFY" } }),
        db.user.count({ where: { role: "CUSTOMER" } }),
        db.product.count(),
        db.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: { user: { select: { name: true } }, items: true },
        }),
      ]);

    // top products by quantity sold
    const top = await db.orderItem.groupBy({
      by: ["productId", "productName"],
      where: { order: paidFilter },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // sales per day, last 7 days
    const days: { date: string; total: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      days.push({ date: start.toISOString().slice(0, 10), total: 0 });
      void end;
    }
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const weekOrders = await db.order.findMany({
      where: { ...paidFilter, createdAt: { gte: weekAgo } },
      select: { total: true, createdAt: true },
    });
    for (const o of weekOrders) {
      const d = new Date(o.createdAt);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      const day = days.find((x) => x.date === key);
      if (day) day.total += Number(o.total);
    }

    return NextResponse.json({
      revenue: revenueAgg._sum.total ?? 0,
      totalOrders,
      pendingVerify,
      totalCustomers,
      totalProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        userName: o.user.name,
        total: o.total,
        status: o.status,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
      topProducts: top.map((t) => ({
        productId: t.productId,
        name: t.productName,
        sold: t._sum.quantity ?? 0,
      })),
      salesByDay: days,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
