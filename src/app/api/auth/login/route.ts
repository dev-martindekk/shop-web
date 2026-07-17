import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }
  await setAuthCookie({ uid: user.id, role: user.role, name: user.name, email: user.email });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
