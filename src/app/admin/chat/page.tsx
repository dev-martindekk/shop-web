"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChatBox } from "@/components/ChatBox";

type Conv = {
  id: number;
  user: { id: number; name: string; email: string };
  lastMessage: string | null;
  lastAt: string;
  unread: number;
};

export default function AdminChatPage() {
  const { t } = useI18n();
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/chat")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []));
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">💬 {t("chat")}</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-h-[70vh] overflow-y-auto">
          <div className="p-3 border-b border-slate-100 font-semibold text-sm">
            {t("conversations")} ({conversations.length})
          </div>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 ${
                selected?.id === c.id ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{c.user.name}</span>
                {c.unread > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {c.unread}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {c.lastMessage ?? "—"}
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="p-4 text-sm text-slate-400">—</p>
          )}
        </div>

        <div className="md:col-span-2">
          {selected ? (
            <div>
              <div className="bg-white border border-slate-200 rounded-t-xl px-4 py-2.5 text-sm font-medium border-b-0">
                👤 {selected.user.name}{" "}
                <span className="text-slate-400 font-normal">({selected.user.email})</span>
              </div>
              <ChatBox
                key={selected.id}
                fetchUrl={`/api/admin/chat/${selected.id}`}
                postUrl={`/api/admin/chat/${selected.id}`}
                viewerIsAdmin={true}
              />
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
              {t("selectConversation")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
