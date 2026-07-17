import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSoldMap, getRatingMap } from "@/lib/product-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true },
    include: {
      images: { orderBy: { sort: "asc" } },
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [soldMap, ratingMap] = await Promise.all([
    getSoldMap([productId]),
    getRatingMap([productId]),
  ]);

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category.name,
      categorySlug: product.category.slug,
      images: product.images.map((i) => i.url),
      sold: soldMap.get(productId) ?? 0,
      rating: ratingMap.get(productId)?.avg ?? 0,
      reviewCount: ratingMap.get(productId)?.count ?? 0,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user.name,
        createdAt: r.createdAt,
      })),
    },
  });
}
