import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

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
