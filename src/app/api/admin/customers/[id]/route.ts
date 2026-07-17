import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const targetId = parseInt(id);
    const target = await db.user.findUnique({ where: { id: targetId } });
    if (!target || target.role !== "CUSTOMER") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { name, email, phone, password } = await req.json();
    if (email) {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing && existing.id !== targetId) {
        return NextResponse.json({ error: "emailTaken" }, { status: 409 });
      }
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const customer = await db.user.update({
      where: { id: targetId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
    return NextResponse.json({ customer });
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
    const targetId = parseInt(id);
    const target = await db.user.findUnique({ where: { id: targetId } });
    if (!target || target.role !== "CUSTOMER") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const orderCount = await db.order.count({ where: { userId: targetId } });
    if (orderCount > 0) {
      return NextResponse.json({ error: "hasOrders" }, { status: 409 });
    }
    await db.user.delete({ where: { id: targetId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
