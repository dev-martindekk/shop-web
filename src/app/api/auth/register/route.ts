import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json();
  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "emailTaken" }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, password: hashed, phone: phone || null },
  });
  await setAuthCookie({ uid: user.id, role: user.role, name: user.name, email: user.email });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
