import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const unreadCounts = await db.chatMessage.groupBy({
      by: ["conversationId"],
      where: { isFromAdmin: false, readByAdmin: false },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]));
    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        user: c.user,
        lastMessage: c.messages[0]?.body ?? null,
        lastAt: c.messages[0]?.createdAt ?? c.updatedAt,
        unread: unreadMap.get(c.id) ?? 0,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
