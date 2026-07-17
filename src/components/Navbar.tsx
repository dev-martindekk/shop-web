"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n, Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useUser } from "@/lib/user";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "lo", label: "ລາວ", flag: "🇱🇦" },
];

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const { user, logout } = useUser();
  const router = useRouter();
  const [q, setQ] = useState("");

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <Link href="/" className="text-xl font-extrabold text-indigo-600 shrink-0">
          🛒 EZShop
        </Link>

        <form onSubmit={search} className="flex-1 min-w-[160px] max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-slate-300 px-4 py-1.5 text-sm bg-slate-50"
          />
        </form>

        <nav className="flex items-center gap-1.5 text-sm ml-auto">
          <div className="flex rounded-full border border-slate-200 overflow-hidden mr-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 text-xs ${
                  lang === l.code ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
                title={l.label}
              >
                {l.flag}
              </button>
            ))}
          </div>

          <Link href="/cart" className="relative px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
            🛍️ <span className="hidden sm:inline">{t("cart")}</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/orders" className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                📦 <span className="hidden sm:inline">{t("myOrders")}</span>
              </Link>
              <Link href="/chat" className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                💬 <span className="hidden sm:inline">{t("chat")}</span>
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  ⚙️ <span className="hidden sm:inline">{t("adminPanel")}</span>
                </Link>
              )}
              <span className="hidden md:inline text-slate-500 px-1 max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                  router.refresh();
                }}
                className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded-lg hover:bg-slate-100">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {t("register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
