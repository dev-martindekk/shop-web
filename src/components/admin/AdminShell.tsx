"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n, Lang } from "@/lib/i18n";
import { useUser } from "@/lib/user";

const LANGS: { code: Lang; flag: string }[] = [
  { code: "th", flag: "🇹🇭" },
  { code: "en", flag: "🇬🇧" },
  { code: "lo", flag: "🇱🇦" },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();

  const items = [
    { href: "/admin", icon: "📊", label: t("dashboard") },
    { href: "/admin/orders", icon: "📦", label: t("orders") },
    { href: "/admin/products", icon: "🏷️", label: t("products") },
    { href: "/admin/categories", icon: "🗂️", label: t("categories") },
    { href: "/admin/customers", icon: "👥", label: t("customers") },
    { href: "/admin/admins", icon: "🛡️", label: t("admins") },
    { href: "/admin/payments", icon: "🏦", label: t("payments") },
    { href: "/admin/chat", icon: "💬", label: t("chat") },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <Link href="/" className="px-5 py-4 text-lg font-extrabold text-white border-b border-slate-800">
          🛒 EZShop
        </Link>
        <nav className="flex-1 py-3">
          {items.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 rounded text-xs ${
                  lang === l.code ? "bg-indigo-600" : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {l.flag}
              </button>
            ))}
          </div>
          <div className="text-xs truncate">{adminName}</div>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="text-xs text-rose-400 hover:text-rose-300"
          >
            ⎋ {t("logout")}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-slate-50 min-w-0">{children}</main>
    </div>
  );
}
