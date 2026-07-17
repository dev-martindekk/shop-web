import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";
import { SOLD_STATUSES } from "@/lib/product-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const productId = parseInt(id);
    const { rating, comment } = await req.json();

    const r = parseInt(rating);
    if (isNaN(productId) || isNaN(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    const purchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.uid, status: { in: [...SOLD_STATUSES] } },
      },
    });
    if (!purchased) {
      return NextResponse.json({ error: "mustPurchaseToReview" }, { status: 403 });
    }

    const review = await db.review.upsert({
      where: { productId_userId: { productId, userId: session.uid } },
      update: { rating: r, comment: comment || null },
      create: { productId, userId: session.uid, rating: r, comment: comment || null },
    });
    return NextResponse.json({ review });
  } catch (e) {
    return handleApiError(e);
  }
}
