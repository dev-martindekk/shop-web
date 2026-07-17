import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const accounts = await db.bankAccount.findMany({
    where: { isActive: true },
    select: { id: true, bankName: true, accountName: true, accountNumber: true, qrCodeUrl: true },
  });
  return NextResponse.json({ accounts });
}
