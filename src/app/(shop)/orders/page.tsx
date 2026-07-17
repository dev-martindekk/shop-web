"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import { StatusBadge } from "@/components/StatusBadge";

type OrderRow = {
  id: number;
  status: string;
  total: string;
  createdAt: string;
  items: { id: number; productName: string; quantity: number }[];
};

export default function OrdersPage() {
  const { t, lang } = useI18n();
  const { user, loading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []));
    }
  }, [user]);

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  if (!user || orders === null)
    return <div className="text-center py-16 text-slate-400">{t("loading")}</div>;

  if (orders.length === 0)
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📦</div>
        <p className="text-slate-400">{t("noOrders")}</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-5">📦 {t("myOrders")}</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-bold">{t("orderNo")}{o.id}</span>
                <span className="text-xs text-slate-400 ml-3">
                  {new Date(o.createdAt).toLocaleString(dateLocale)}
                </span>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="text-sm text-slate-500 mt-1 line-clamp-1">
              {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
            </div>
            <div className="text-right font-bold text-indigo-600 mt-1">{fmtMoney(o.total)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
