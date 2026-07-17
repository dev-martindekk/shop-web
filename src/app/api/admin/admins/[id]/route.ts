import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const targetId = parseInt(id);
    // scoped to role "ADMIN" only — SUPERADMIN accounts are not manageable here
    const target = await db.user.findUnique({ where: { id: targetId } });
    if (!target || target.role !== "ADMIN") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { name, email, password } = await req.json();
    if (email) {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing && existing.id !== targetId) {
        return NextResponse.json({ error: "emailTaken" }, { status: 409 });
      }
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const admin = await db.user.update({
      where: { id: targetId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json({ admin });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const targetId = parseInt(id);
    if (targetId === session.uid) {
      return NextResponse.json({ error: "cannot delete yourself" }, { status: 400 });
    }
    // scoped to role "ADMIN" only — SUPERADMIN accounts are not manageable here
    const target = await db.user.findUnique({ where: { id: targetId } });
    if (!target || target.role !== "ADMIN") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    // demote to customer instead of hard delete to preserve history
    await db.user.update({ where: { id: targetId }, data: { role: "CUSTOMER" } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return handleApiError(e);
  }
}
