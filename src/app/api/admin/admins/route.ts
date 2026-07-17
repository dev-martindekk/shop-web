import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    // SUPERADMIN accounts are intentionally excluded from this list
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ admins });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { name, email, password } = await req.json();
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "emailTaken" }, { status: 409 });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await db.user.create({
      data: { name, email, password: hashed, role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json({ admin });
  } catch (e) {
    return handleApiError(e);
  }
}
