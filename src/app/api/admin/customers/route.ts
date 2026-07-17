import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await db.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ customers });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "emailTaken" }, { status: 409 });
    const hashed = await bcrypt.hash(password, 10);
    const customer = await db.user.create({
      data: { name, email, password: hashed, phone: phone || null, role: "CUSTOMER" },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
    return NextResponse.json({ customer });
  } catch (e) {
    return handleApiError(e);
  }
}
