"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import { ChatBox } from "@/components/ChatBox";
import { ArrowRightIcon, ChatIcon, XIcon } from "@/components/icons";

export function ChatWidget() {
  const { t } = useI18n();
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white shrink-0">
            <span className="flex items-center gap-2 font-medium text-sm">
              <ChatIcon size={16} />
              {t("chatWithAdmin")}
            </span>
            <button onClick={() => setOpen(false)} className="hover:opacity-80">
              <XIcon size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              {t("loading")}
            </div>
          ) : !user ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <ChatIcon size={36} strokeWidth={1.25} className="text-slate-300" />
              <p className="text-slate-400 text-sm">{t("loginToChat")}</p>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-indigo-600 font-medium text-sm"
              >
                {t("login")} <ArrowRightIcon size={15} />
              </Link>
            </div>
          ) : (
            <ChatBox fetchUrl="/api/chat" postUrl="/api/chat" viewerIsAdmin={false} className="flex-1" />
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("chatWithAdmin")}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-colors"
      >
        {open ? <XIcon size={22} /> : <ChatIcon size={22} />}
      </button>
    </div>
  );
}
