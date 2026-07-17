"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { CheckIcon, EditIcon, PlusIcon, TrashIcon, UsersIcon, XIcon } from "@/components/icons";

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
  const confirmDialog = useConfirm();
  const showToast = useToast();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [editError, setEditError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []));
  }, []);

  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", email: "", phone: "", password: "" });
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "emailTaken" ? t("emailTaken") : t("error"));
    }
  };

  const startEdit = (c: Customer) => {
    setEditing(c.id);
    setEditForm({ name: c.name, email: c.email, phone: c.phone ?? "", password: "" });
    setEditError("");
  };

  const saveEdit = async (id: number) => {
    setEditError("");
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        ...(editForm.password ? { password: editForm.password } : {}),
      }),
    });
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error === "emailTaken" ? t("emailTaken") : t("error"));
    }
  };

  const del = async (c: Customer) => {
    if (!(await confirmDialog(t("confirmDelete")))) return;
    const res = await fetch(`/api/admin/customers/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error === "hasOrders" ? t("cannotDeleteHasOrders") : t("error"));
    }
  };

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  return (
    <div className="max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-5">
        <UsersIcon size={22} />
        {t("customers")}
      </h1>

      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-5 bg-white rounded-xl border border-slate-200 p-4">
        <input required value={form.name} placeholder={t("fullName")}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required type="email" value={form.email} placeholder={t("email")}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input value={form.phone} placeholder={t("phone")}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required type="password" minLength={6} value={form.password} placeholder={t("password")}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <button className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <PlusIcon size={16} />
          {t("addCustomer")}
        </button>
      </form>
      {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="p-3">{t("fullName")}</th>
              <th className="p-3">{t("email")}</th>
              <th className="p-3">{t("phone")}</th>
              <th className="p-3">{t("orderCount")}</th>
              <th className="p-3">{t("joinedAt")}</th>
              <th className="p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {customers === null ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400">{t("loading")}</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400">-</td></tr>
            ) : (
              customers.map((c) =>
                editing === c.id ? (
                  <tr key={c.id} className="border-b border-slate-50 bg-slate-50">
                    <td className="p-2">
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                    </td>
                    <td className="p-2">
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                    </td>
                    <td className="p-2">
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                    </td>
                    <td className="p-2 text-slate-400">{c._count.orders}</td>
                    <td className="p-2" colSpan={2}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input type="password" minLength={6} value={editForm.password} placeholder={t("newPasswordOptional")}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          className="flex-1 min-w-[160px] border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                        <button onClick={() => saveEdit(c.id)} className="flex items-center gap-1 text-emerald-600 font-medium text-xs shrink-0">
                          <CheckIcon size={13} />
                          {t("save")}
                        </button>
                        <button onClick={() => setEditing(null)} className="flex items-center gap-1 text-slate-400 text-xs shrink-0">
                          <XIcon size={13} />
                          {t("cancel")}
                        </button>
                      </div>
                      {editError && <p className="text-rose-500 text-xs mt-1">{editError}</p>}
                    </td>
                  </tr>
                ) : (
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
                    <td className="p-3 whitespace-nowrap">
                      <button onClick={() => startEdit(c)} className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-xs font-medium mr-3">
                        <EditIcon size={13} />
                        {t("edit")}
                      </button>
                      <button onClick={() => del(c)} className="inline-flex items-center gap-1 text-rose-500 hover:underline text-xs font-medium">
                        <TrashIcon size={13} />
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
