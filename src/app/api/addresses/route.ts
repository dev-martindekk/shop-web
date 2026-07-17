import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireUser();
    const addresses = await db.address.findMany({
      where: { userId: session.uid },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ addresses });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { label, name, phone, address, isDefault } = await req.json();
    if (!label || !name || !phone || !address) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    if (isDefault) {
      await db.address.updateMany({ where: { userId: session.uid }, data: { isDefault: false } });
    }
    const created = await db.address.create({
      data: { userId: session.uid, label, name, phone, address, isDefault: !!isDefault },
    });
    return NextResponse.json({ address: created });
  } catch (e) {
    return handleApiError(e);
  }
}
