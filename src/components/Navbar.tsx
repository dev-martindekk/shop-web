"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useUser } from "@/lib/user";
import { BagIcon, PackageIcon, SearchIcon, SettingsIcon, StoreIcon } from "@/components/icons";
import { LangDropdown } from "@/components/LangDropdown";

export function Navbar() {
  const { t } = useI18n();
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 flex-wrap">
        <Link href="/" className="flex items-center gap-1.5 text-lg sm:text-xl font-extrabold text-indigo-600 shrink-0">
          <StoreIcon size={20} strokeWidth={2} />
          EZShop
        </Link>

        <form onSubmit={search} className="relative order-3 sm:order-none w-full sm:w-auto sm:flex-1 sm:min-w-[160px] sm:max-w-md">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-slate-300 pl-9 pr-4 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </form>

        <nav className="flex items-center gap-1 sm:gap-1.5 text-sm ml-auto">
          <LangDropdown />

          <Link href="/cart" className="relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
            <BagIcon size={18} />
            <span className="hidden lg:inline">{t("cart")}</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/orders" className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                <PackageIcon size={18} />
                <span className="hidden lg:inline">{t("myOrders")}</span>
              </Link>
              {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  <SettingsIcon size={18} />
                  <span className="hidden lg:inline">{t("adminPanel")}</span>
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
                className="px-2 sm:px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
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
