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
    const { bankName, accountName, accountNumber, isActive } = await req.json();
    const account = await db.bankAccount.update({
      where: { id: parseInt(id) },
      data: {
        ...(bankName != null ? { bankName } : {}),
        ...(accountName != null ? { accountName } : {}),
        ...(accountNumber != null ? { accountNumber } : {}),
        ...(isActive != null ? { isActive: !!isActive } : {}),
      },
    });
    return NextResponse.json({ account });
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
    const accountId = parseInt(id);
    const orderCount = await db.order.count({ where: { bankAccountId: accountId } });
    if (orderCount > 0) {
      await db.bankAccount.update({ where: { id: accountId }, data: { isActive: false } });
      return NextResponse.json({ softDeleted: true });
    }
    await db.bankAccount.delete({ where: { id: accountId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
