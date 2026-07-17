import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: { orderBy: { sort: "asc" } }, category: true },
    });
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const productId = parseInt(id);
    const { name, description, price, stock, categoryId, isActive, images } = await req.json();

    const product = await db.$transaction(async (tx) => {
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: images.map((url: string, i: number) => ({ productId, url, sort: i })),
        });
      }
      return tx.product.update({
        where: { id: productId },
        data: {
          ...(name != null ? { name } : {}),
          ...(description != null ? { description } : {}),
          ...(price != null ? { price } : {}),
          ...(stock != null ? { stock: parseInt(stock) } : {}),
          ...(categoryId != null ? { categoryId: parseInt(categoryId) } : {}),
          ...(isActive != null ? { isActive: !!isActive } : {}),
        },
        include: { images: { orderBy: { sort: "asc" } } },
      });
    });
    return NextResponse.json({ product });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const productId = parseInt(id);
    const orderCount = await db.orderItem.count({ where: { productId } });
    if (orderCount > 0) {
      // keep history integrity: soft-delete instead
      await db.product.update({ where: { id: productId }, data: { isActive: false } });
      return NextResponse.json({ softDeleted: true });
    }
    await db.product.delete({ where: { id: productId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
