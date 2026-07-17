"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";

type Stats = {
  revenue: string | number;
  totalOrders: number;
  pendingVerify: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: {
    id: number;
    userName: string;
    total: string;
    status: string;
    itemCount: number;
    createdAt: string;
  }[];
  topProducts: { productId: number; name: string; sold: number }[];
  salesByDay: { date: string; total: number }[];
};

export default function AdminDashboard() {
  const { t, lang } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="text-slate-400">{t("loading")}</div>;

  const maxDay = Math.max(...stats.salesByDay.map((d) => d.total), 1);
  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  const cards = [
    { label: t("revenue"), value: fmtMoney(stats.revenue), icon: "💰", color: "bg-emerald-50 text-emerald-700" },
    { label: t("totalOrders"), value: stats.totalOrders, icon: "📦", color: "bg-indigo-50 text-indigo-700" },
    { label: t("pendingVerifyOrders"), value: stats.pendingVerify, icon: "🧾", color: "bg-amber-50 text-amber-700" },
    { label: t("totalCustomers"), value: stats.totalCustomers, icon: "👥", color: "bg-sky-50 text-sky-700" },
    { label: t("totalProducts"), value: stats.totalProducts, icon: "🏷️", color: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">📊 {t("dashboard")}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <div className="text-2xl">{c.icon}</div>
            <div className="text-xl font-extrabold mt-1">{c.value}</div>
            <div className="text-xs opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">📈 {t("salesLast7Days")}</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.salesByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-slate-500">
                  {d.total > 0 ? fmtMoney(d.total) : ""}
                </div>
                <div
                  className="w-full bg-indigo-500 rounded-t-md min-h-[2px] transition-all"
                  style={{ height: `${(d.total / maxDay) * 100}%` }}
                />
                <div className="text-[10px] text-slate-400">
                  {new Date(d.date + "T00:00:00").toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">🔥 {t("topProducts")}</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">-</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 line-clamp-1">{p.name}</span>
                  <span className="text-slate-500">
                    {t("sold")} <b className="text-slate-700">{p.sold}</b>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mt-5">
        <h2 className="font-bold mb-3">🕘 {t("recentOrders")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">{t("buyer")}</th>
                <th className="py-2 pr-3">{t("itemCount")}</th>
                <th className="py-2 pr-3">{t("total")}</th>
                <th className="py-2 pr-3">{t("status")}</th>
                <th className="py-2">{t("date")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 pr-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-indigo-600 font-medium">
                      #{o.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{o.userName}</td>
                  <td className="py-2 pr-3">{o.itemCount}</td>
                  <td className="py-2 pr-3 font-medium">{fmtMoney(o.total)}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2 text-slate-400">
                    {new Date(o.createdAt).toLocaleString(dateLocale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
