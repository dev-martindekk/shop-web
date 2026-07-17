import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const conversationId = parseInt(id);
    await db.chatMessage.updateMany({
      where: { conversationId, isFromAdmin: false, readByAdmin: false },
      data: { readByAdmin: true },
    });
    const messages = await db.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return NextResponse.json({ messages });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const conversationId = parseInt(id);
    const { body } = await req.json();
    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "empty message" }, { status: 400 });
    }
    const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });

    const message = await db.chatMessage.create({
      data: {
        conversationId,
        senderId: session.uid,
        body: body.trim().slice(0, 2000),
        isFromAdmin: true,
        readByAdmin: true,
      },
    });
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return NextResponse.json({ message });
  } catch (e) {
    return handleApiError(e);
  }
}
