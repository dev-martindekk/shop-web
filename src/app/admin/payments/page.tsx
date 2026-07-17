"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Bank = {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isActive: boolean;
};

export default function AdminPaymentsPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<Bank[]>([]);
  const [form, setForm] = useState({ bankName: "", accountName: "", accountNumber: "" });

  const load = useCallback(() => {
    fetch("/api/admin/bank-accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []));
  }, []);

  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ bankName: "", accountName: "", accountNumber: "" });
      load();
    }
  };

  const toggle = async (b: Bank) => {
    await fetch(`/api/admin/bank-accounts/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    load();
  };

  const del = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/admin/bank-accounts/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-5">🏦 {t("payments")}</h1>

      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-5 bg-white rounded-xl border border-slate-200 p-4">
        <input required value={form.bankName} placeholder={t("bankName")}
          onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required value={form.accountName} placeholder={t("accountName")}
          onChange={(e) => setForm({ ...form, accountName: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required value={form.accountNumber} placeholder={t("accountNumber")}
          onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + {t("addBank")}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {accounts.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3.5 text-sm">
            <span className="text-2xl">🏦</span>
            <div className="flex-1">
              <div className="font-medium">{b.bankName}</div>
              <div className="text-xs text-slate-400">
                {b.accountName} · <span className="tracking-wider text-slate-600 font-medium">{b.accountNumber}</span>
              </div>
            </div>
            <button
              onClick={() => toggle(b)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              }`}
            >
              {b.isActive ? t("active") : t("inactive")}
            </button>
            <button onClick={() => del(b.id)} className="text-rose-500 text-xs font-medium">
              🗑️ {t("delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
