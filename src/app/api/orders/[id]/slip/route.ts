import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const orderId = parseInt(id);

    const order = await db.order.findFirst({
      where: { id: orderId, userId: session.uid },
    });
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (order.status !== "PENDING_PAYMENT" && order.status !== "PENDING_VERIFY") {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("slip");
    const bankAccountId = form.get("bankAccountId");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }

    const url = await saveUploadedImage(file);
    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        slipUrl: url,
        status: "PENDING_VERIFY",
        bankAccountId: bankAccountId ? parseInt(bankAccountId as string) : null,
      },
    });
    return NextResponse.json({ order: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
