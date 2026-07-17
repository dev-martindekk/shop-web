"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import {
  BankIcon,
  BarChartIcon,
  ChatIcon,
  FolderIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  ShieldIcon,
  StoreIcon,
  TagIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";
import { LangDropdown } from "@/components/LangDropdown";

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const items = [
    { href: "/admin", icon: BarChartIcon, label: t("dashboard") },
    { href: "/admin/orders", icon: PackageIcon, label: t("orders") },
    { href: "/admin/products", icon: TagIcon, label: t("products") },
    { href: "/admin/categories", icon: FolderIcon, label: t("categories") },
    { href: "/admin/customers", icon: UsersIcon, label: t("customers") },
    { href: "/admin/admins", icon: ShieldIcon, label: t("admins") },
    { href: "/admin/payments", icon: BankIcon, label: t("payments") },
    { href: "/admin/chat", icon: ChatIcon, label: t("chat") },
  ];

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
          <StoreIcon size={20} strokeWidth={2} />
          EZShop
        </Link>
        <button onClick={() => setMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
          <XIcon size={20} />
        </button>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />}
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-3">
        <LangDropdown variant="dark" openUp />
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400 truncate">{adminName}</div>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 shrink-0"
          >
            <LogOutIcon size={13} />
            {t("logout")}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-slate-900 text-white px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <StoreIcon size={18} strokeWidth={2} />
          EZShop
        </Link>
        <button onClick={() => setMenuOpen(true)} aria-label="menu">
          <MenuIcon size={22} />
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)} />
      )}

      <aside
        className={`w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 fixed inset-y-0 left-0 z-50 transform transition-transform md:static md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 p-4 sm:p-6 pt-20 md:pt-6 bg-slate-50 min-w-0">{children}</main>
    </div>
  );
}
