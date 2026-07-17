"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { CheckIcon, EditIcon, FolderIcon, PlusIcon, TrashIcon, XIcon } from "@/components/icons";

type Cat = { id: number; name: string; slug: string; _count: { products: number } };

export default function AdminCategoriesPage() {
  const { t } = useI18n();
  const confirmDialog = useConfirm();
  const showToast = useToast();
  const [categories, setCategories] = useState<Cat[]>([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", slug: "" });
      load();
    } else setError(t("error"));
  };

  const save = async (id: number) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditing(null);
    load();
  };

  const del = async (id: number) => {
    if (!(await confirmDialog(t("confirmDelete")))) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) showToast(t("error"));
    load();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-5">
        <FolderIcon size={22} />
        {t("categories")}
      </h1>

      <form onSubmit={add} className="flex gap-2 mb-5 bg-white rounded-xl border border-slate-200 p-4">
        <input required value={form.name} placeholder={t("categoryName")}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required value={form.slug} placeholder={t("slug")} pattern="[a-z0-9-]+"
          onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
          className="w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <button className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <PlusIcon size={16} />
          {t("addCategory")}
        </button>
      </form>
      {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3.5 text-sm">
            {editing === c.id ? (
              <>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5" />
                <input value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="w-36 border border-slate-300 rounded-lg px-2.5 py-1.5" />
                <button onClick={() => save(c.id)} className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckIcon size={14} />
                  {t("save")}
                </button>
                <button onClick={() => setEditing(null)} className="text-slate-400">
                  <XIcon size={14} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium">{c.name}</span>
                <span className="text-slate-400 text-xs">/{c.slug}</span>
                <span className="text-xs bg-slate-100 rounded-full px-2 py-0.5">
                  {c._count.products} {t("products")}
                </span>
                <button
                  onClick={() => {
                    setEditing(c.id);
                    setEditForm({ name: c.name, slug: c.slug });
                  }}
                  className="flex items-center gap-1 text-indigo-600 text-xs font-medium"
                >
                  <EditIcon size={13} />
                  {t("edit")}
                </button>
                <button onClick={() => del(c.id)} className="text-rose-500 text-xs font-medium"
                  title={c._count.products > 0 ? "" : t("delete")}>
                  <TrashIcon size={13} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
