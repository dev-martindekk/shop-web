import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const accounts = await db.bankAccount.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ accounts });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { bankName, accountName, accountNumber } = await req.json();
    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const account = await db.bankAccount.create({
      data: { bankName, accountName, accountNumber },
    });
    return NextResponse.json({ account });
  } catch (e) {
    return handleApiError(e);
  }
}
