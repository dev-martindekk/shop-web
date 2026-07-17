import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const products = await db.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sort: "asc" } },
        _count: { select: { orderItems: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { name, description, price, stock, categoryId, isActive, images } = await req.json();
    if (!name || price == null || categoryId == null) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const product = await db.product.create({
      data: {
        name,
        description: description || "",
        price,
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        isActive: isActive !== false,
        images: {
          create: (Array.isArray(images) ? images : []).map((url: string, i: number) => ({
            url,
            sort: i,
          })),
        },
      },
      include: { images: true },
    });
    return NextResponse.json({ product });
  } catch (e) {
    return handleApiError(e);
  }
}
