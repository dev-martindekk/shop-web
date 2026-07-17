"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

export type ChatMsg = {
  id: number;
  body: string;
  isFromAdmin: boolean;
  createdAt: string;
};

export function ChatBox({
  fetchUrl,
  postUrl,
  viewerIsAdmin,
}: {
  fetchUrl: string;
  postUrl: string;
  viewerIsAdmin: boolean;
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {}
  }, [fetchUrl]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [load]);

  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    setSending(false);
    if (res.ok) {
      setText("");
      load();
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-slate-50 rounded-t-xl">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8">💬</p>
        )}
        {messages.map((m) => {
          const mine = viewerIsAdmin ? m.isFromAdmin : !m.isFromAdmin;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                  mine
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 rounded-bl-sm"
                }`}
              >
                {!mine && (
                  <div className="text-[10px] opacity-60 mb-0.5">
                    {m.isFromAdmin ? t("admin") : t("you")}
                  </div>
                )}
                {m.body}
                <div className={`text-[10px] mt-1 ${mine ? "text-indigo-200" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 p-3 bg-white border border-slate-200 rounded-b-xl">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("typeMessage")}
          className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm"
        />
        <button
          disabled={sending || !text.trim()}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {t("send")} ➤
        </button>
      </form>
    </div>
  );
}
