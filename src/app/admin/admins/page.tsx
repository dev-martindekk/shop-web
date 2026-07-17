"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";

type Admin = { id: number; name: string; email: string; createdAt: string };

export default function AdminAdminsPage() {
  const { t, lang } = useI18n();
  const { user } = useUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/admins")
      .then((r) => r.json())
      .then((d) => setAdmins(d.admins ?? []));
  }, []);

  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", email: "", password: "" });
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "emailTaken" ? t("emailTaken") : t("error"));
    }
  };

  const del = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    load();
  };

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-5">🛡️ {t("admins")}</h1>

      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-5 bg-white rounded-xl border border-slate-200 p-4">
        <input required value={form.name} placeholder={t("fullName")}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required type="email" value={form.email} placeholder={t("email")}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required type="password" minLength={6} value={form.password} placeholder={t("password")}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + {t("addAdmin")}
        </button>
      </form>
      {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-3.5 text-sm">
            <span className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
              {a.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1">
              <div className="font-medium">
                {a.name}
                {user?.id === a.id && (
                  <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5">
                    {t("you")}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">{a.email}</div>
            </div>
            <span className="text-xs text-slate-400">
              {t("joinedAt")} {new Date(a.createdAt).toLocaleDateString(dateLocale)}
            </span>
            {user?.id !== a.id && (
              <button onClick={() => del(a.id)} className="text-rose-500 text-xs font-medium">
                🗑️ {t("delete")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
