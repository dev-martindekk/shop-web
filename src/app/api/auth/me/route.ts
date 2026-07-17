import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await db.user.findUnique({
    where: { id: session.uid },
    select: { id: true, name: true, email: true, role: true, phone: true, address: true },
  });
  return NextResponse.json({ user });
}
