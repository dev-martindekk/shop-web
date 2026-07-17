import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const count = await db.chatMessage.count({
      where: { isFromAdmin: false, readByAdmin: false },
    });
    return NextResponse.json({ count });
  } catch (e) {
    return handleApiError(e);
  }
}
