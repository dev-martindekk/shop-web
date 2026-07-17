import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireUser();
    const conversation = await db.conversation.upsert({
      where: { userId: session.uid },
      update: {},
      create: { userId: session.uid },
    });
    await db.chatMessage.updateMany({
      where: { conversationId: conversation.id, isFromAdmin: true, readByCustomer: false },
      data: { readByCustomer: true },
    });
    const messages = await db.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return NextResponse.json({ messages });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { body } = await req.json();
    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "empty message" }, { status: 400 });
    }
    const conversation = await db.conversation.upsert({
      where: { userId: session.uid },
      update: { updatedAt: new Date() },
      create: { userId: session.uid },
    });
    const message = await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.uid,
        body: body.trim().slice(0, 2000),
        isFromAdmin: false,
        readByCustomer: true,
      },
    });
    return NextResponse.json({ message });
  } catch (e) {
    return handleApiError(e);
  }
}
