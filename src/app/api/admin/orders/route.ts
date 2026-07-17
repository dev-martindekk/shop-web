import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const orders = await db.order.findMany({
      where: status && status in OrderStatus ? { status: status as OrderStatus } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        bankAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return handleApiError(e);
  }
}
