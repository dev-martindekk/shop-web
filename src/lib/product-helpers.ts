import { db } from "./db";

export const SOLD_STATUSES = ["PAID", "SHIPPED", "COMPLETED"] as const;

export async function getSoldMap(productIds: number[]): Promise<Map<number, number>> {
  if (productIds.length === 0) return new Map();
  const grouped = await db.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { in: productIds },
      order: { status: { in: [...SOLD_STATUSES] } },
    },
    _sum: { quantity: true },
  });
  return new Map(grouped.map((g) => [g.productId, g._sum.quantity ?? 0]));
}

export async function getRatingMap(
  productIds: number[]
): Promise<Map<number, { avg: number; count: number }>> {
  if (productIds.length === 0) return new Map();
  const grouped = await db.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return new Map(
    grouped.map((g) => [g.productId, { avg: g._avg.rating ?? 0, count: g._count.rating }])
  );
}
