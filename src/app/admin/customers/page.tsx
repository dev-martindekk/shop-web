"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
};

export default function AdminCustomersPage() {
  const { t, lang } = useI18n();
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []));
  }, []);

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-5">👥 {t("customers")}</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="p-3">{t("fullName")}</th>
              <th className="p-3">{t("email")}</th>
              <th className="p-3">{t("phone")}</th>
              <th className="p-3">{t("orderCount")}</th>
              <th className="p-3">{t("joinedAt")}</th>
            </tr>
          </thead>
          <tbody>
            {customers === null ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">{t("loading")}</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-slate-500">{c.email}</td>
                  <td className="p-3 text-slate-500">{c.phone ?? "—"}</td>
                  <td className="p-3">
                    <span className="bg-indigo-50 text-indigo-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {c._count.orders}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString(dateLocale)}
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
