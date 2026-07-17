"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import { ChatBox } from "@/components/ChatBox";

export default function ChatPage() {
  const { t } = useI18n();
  const { user, loading } = useUser();

  if (loading) return <div className="text-center py-16 text-slate-400">{t("loading")}</div>;

  if (!user)
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">💬</div>
        <p className="text-slate-400 mb-4">{t("loginToChat")}</p>
        <Link href="/login" className="text-indigo-600 font-medium">
          {t("login")} →
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">💬 {t("chatWithAdmin")}</h1>
      <ChatBox fetchUrl="/api/chat" postUrl="/api/chat" viewerIsAdmin={false} />
    </div>
  );
}
