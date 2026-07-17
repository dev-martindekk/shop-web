import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const addressId = parseInt(id);
    const target = await db.address.findUnique({ where: { id: addressId } });
    if (!target || target.userId !== session.uid) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { label, name, phone, address, isDefault } = await req.json();
    if (isDefault) {
      await db.address.updateMany({ where: { userId: session.uid }, data: { isDefault: false } });
    }
    const updated = await db.address.update({
      where: { id: addressId },
      data: {
        ...(label != null ? { label } : {}),
        ...(name != null ? { name } : {}),
        ...(phone != null ? { phone } : {}),
        ...(address != null ? { address } : {}),
        ...(isDefault != null ? { isDefault: !!isDefault } : {}),
      },
    });
    return NextResponse.json({ address: updated });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const addressId = parseInt(id);
    const target = await db.address.findUnique({ where: { id: addressId } });
    if (!target || target.userId !== session.uid) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    await db.address.delete({ where: { id: addressId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
