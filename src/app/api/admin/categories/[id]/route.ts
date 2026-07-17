import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { name, slug } = await req.json();
    const category = await db.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
      },
    });
    return NextResponse.json({ category });
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
    const categoryId = parseInt(id);
    const productCount = await db.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return NextResponse.json({ error: "category has products" }, { status: 409 });
    }
    await db.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
