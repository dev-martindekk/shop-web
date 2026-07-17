"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";

const STATUSES = ["", "PENDING_PAYMENT", "PENDING_VERIFY", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

type OrderRow = {
  id: number;
  status: string;
  total: string;
  slipUrl: string | null;
  createdAt: string;
  user: { name: string; email: string };
  items: { id: number }[];
};

export default function AdminOrdersPage() {
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setOrders(null);
    fetch(`/api/admin/orders${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []));
  }, [filter]);

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">📦 {t("orders")}</h1>

      <div className="flex gap-2 flex-wrap mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              filter === s
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white border-slate-300 hover:border-slate-500"
            }`}
          >
            {s === "" ? t("all") : t(`st_${s}`)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="p-3">#</th>
              <th className="p-3">{t("buyer")}</th>
              <th className="p-3">{t("itemCount")}</th>
              <th className="p-3">{t("total")}</th>
              <th className="p-3">{t("uploadSlip")}</th>
              <th className="p-3">{t("status")}</th>
              <th className="p-3">{t("date")}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders === null ? (
              <tr><td colSpan={8} className="p-6 text-center text-slate-400">{t("loading")}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-slate-400">{t("noOrders")}</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3 font-medium">#{o.id}</td>
                  <td className="p-3">
                    <div>{o.user.name}</div>
                    <div className="text-xs text-slate-400">{o.user.email}</div>
                  </td>
                  <td className="p-3">{o.items.length}</td>
                  <td className="p-3 font-semibold">{fmtMoney(o.total)}</td>
                  <td className="p-3">{o.slipUrl ? "🧾" : <span className="text-slate-300">—</span>}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 text-slate-400 text-xs">
                    {new Date(o.createdAt).toLocaleString(dateLocale)}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`}
                      className="text-indigo-600 hover:underline text-xs font-medium">
                      {t("viewDetail")} →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
