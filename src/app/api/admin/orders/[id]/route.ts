import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PENDING_VERIFY: ["PAID", "PENDING_PAYMENT", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const orderId = parseInt(id);
    const { status } = await req.json();

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (!ALLOWED_TRANSITIONS[order.status]?.includes(status)) {
      return NextResponse.json({ error: "invalid transition" }, { status: 400 });
    }

    const updated = await db.$transaction(async (tx) => {
      if (status === "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      return tx.order.update({ where: { id: orderId }, data: { status } });
    });

    return NextResponse.json({ order: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
