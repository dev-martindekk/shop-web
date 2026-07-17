import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSoldMap, getRatingMap } from "@/lib/product-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  const products = await db.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(q ? { name: { contains: q } } : {}),
      ...(featured ? { isFeatured: true } : {}),
    },
    include: {
      images: { orderBy: { sort: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const ids = products.map((p) => p.id);
  const [soldMap, ratingMap] = await Promise.all([getSoldMap(ids), getRatingMap(ids)]);

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: p.images[0]?.url ?? null,
      category: p.category.name,
      categorySlug: p.category.slug,
      isFeatured: p.isFeatured,
      sold: soldMap.get(p.id) ?? 0,
      rating: ratingMap.get(p.id)?.avg ?? 0,
      reviewCount: ratingMap.get(p.id)?.count ?? 0,
    })),
  });
}
