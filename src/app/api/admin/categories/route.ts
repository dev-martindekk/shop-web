import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await db.category.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { name, slug } = await req.json();
    if (!name || !slug) return NextResponse.json({ error: "invalid input" }, { status: 400 });
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "slug taken" }, { status: 409 });
    const category = await db.category.create({ data: { name, slug } });
    return NextResponse.json({ category });
  } catch (e) {
    return handleApiError(e);
  }
}
