import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const orderId = parseInt(id);

    const order = await db.order.findFirst({
      where: { id: orderId, userId: session.uid },
      include: {
        items: { include: { product: { include: { images: { take: 1, orderBy: { sort: "asc" } } } } } },
        bankAccount: true,
      },
    });
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    return handleApiError(e);
  }
}
