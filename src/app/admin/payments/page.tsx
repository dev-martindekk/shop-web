"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { BankIcon, CheckIcon, CopyIcon, EditIcon, PlusIcon, TrashIcon, UploadIcon, XIcon } from "@/components/icons";

type Bank = {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string | null;
  isActive: boolean;
};

export default function AdminPaymentsPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<Bank[]>([]);
  const [form, setForm] = useState({ bankName: "", accountName: "", accountNumber: "", qrCodeUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ bankName: "", accountName: "", accountNumber: "", qrCodeUrl: "" });
  const [editUploading, setEditUploading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/admin/bank-accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []));
  }, []);

  useEffect(load, [load]);

  const uploadQrCode = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("files", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setForm((f) => ({ ...f, qrCodeUrl: data.urls[0] }));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadEditQrCode = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setEditUploading(true);
    const fd = new FormData();
    fd.append("files", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setEditUploading(false);
    if (res.ok) {
      const data = await res.json();
      setEditForm((f) => ({ ...f, qrCodeUrl: data.urls[0] }));
    }
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ bankName: "", accountName: "", accountNumber: "", qrCodeUrl: "" });
      load();
    }
  };

  const startEdit = (b: Bank) => {
    setEditing(b.id);
    setEditForm({ bankName: b.bankName, accountName: b.accountName, accountNumber: b.accountNumber, qrCodeUrl: b.qrCodeUrl ?? "" });
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/admin/bank-accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditing(null);
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

  const copyAccountNumber = async (b: Bank) => {
    await navigator.clipboard.writeText(b.accountNumber);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId((id) => (id === b.id ? null : id)), 1500);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-5">
        <BankIcon size={22} />
        {t("payments")}
      </h1>

      <form onSubmit={add} className="bg-white rounded-xl border border-slate-200 p-4 mb-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input required value={form.bankName} placeholder={t("bankName")}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
          <input required value={form.accountName} placeholder={t("accountName")}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
          <input required value={form.accountNumber} placeholder={t("accountNumber")}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {form.qrCodeUrl ? (
            <img src={form.qrCodeUrl} alt="qr" className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
          ) : (
            <label className="flex items-center gap-1.5 text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-400 hover:text-indigo-600">
              <UploadIcon size={14} />
              {t("uploadQrCode")}
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => uploadQrCode(e.target.files)} className="hidden" />
            </label>
          )}
          {uploading && <span className="text-xs text-slate-400">{t("loading")}</span>}
          <button className="ml-auto flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            <PlusIcon size={16} />
            {t("addBank")}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {accounts.map((b) =>
          editing === b.id ? (
            <div key={b.id} className="p-3.5 space-y-2 bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input value={editForm.bankName} placeholder={t("bankName")}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <input value={editForm.accountName} placeholder={t("accountName")}
                  onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <input value={editForm.accountNumber} placeholder={t("accountNumber")}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {editForm.qrCodeUrl && (
                  <img src={editForm.qrCodeUrl} alt="qr" className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                )}
                <label className="flex items-center gap-1.5 text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-400 hover:text-indigo-600">
                  <UploadIcon size={14} />
                  {t("uploadQrCode")}
                  <input ref={editFileRef} type="file" accept="image/*" onChange={(e) => uploadEditQrCode(e.target.files)} className="hidden" />
                </label>
                {editForm.qrCodeUrl && (
                  <button type="button" onClick={() => setEditForm({ ...editForm, qrCodeUrl: "" })}
                    className="text-xs text-rose-500">
                    {t("delete")}
                  </button>
                )}
                {editUploading && <span className="text-xs text-slate-400">{t("loading")}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => saveEdit(b.id)} className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                  <CheckIcon size={14} />
                  {t("save")}
                </button>
                <button onClick={() => setEditing(null)} className="flex items-center gap-1 text-slate-400 text-sm">
                  <XIcon size={14} />
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div key={b.id} className="flex items-center gap-3 p-3.5 text-sm">
              {b.qrCodeUrl ? (
                <img src={b.qrCodeUrl} alt="qr" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <BankIcon size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{b.bankName}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  {b.accountName} · <span className="tracking-wider text-slate-600 font-medium">{b.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyAccountNumber(b)}
                    className={`flex items-center gap-1 ${
                      copiedId === b.id ? "text-emerald-600" : "text-slate-400 hover:text-indigo-600"
                    }`}
                    title={t("copy")}
                  >
                    {copiedId === b.id ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    {copiedId === b.id ? t("copied") : t("copy")}
                  </button>
                </div>
              </div>
              <button
                onClick={() => toggle(b)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                }`}
              >
                {b.isActive ? t("active") : t("inactive")}
              </button>
              <button onClick={() => startEdit(b)} className="flex items-center gap-1 text-indigo-600 text-xs font-medium shrink-0">
                <EditIcon size={13} />
                {t("edit")}
              </button>
              <button onClick={() => del(b.id)} className="flex items-center gap-1 text-rose-500 text-xs font-medium shrink-0">
                <TrashIcon size={13} />
                {t("delete")}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
