"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { resizeImageFile } from "@/lib/image";
import { SaveIcon, StarIcon, UploadIcon, XIcon } from "@/components/icons";

type Category = { id: number; name: string };

export type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: number;
  initial?: ProductFormData;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData>(
    initial ?? { name: "", description: "", price: "", stock: "0", categoryId: "", isActive: true, isFeatured: false, images: [] }
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        if (!productId && d.categories?.length && !initial?.categoryId) {
          setForm((f) => (f.categoryId ? f : { ...f, categoryId: String(d.categories[0].id) }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    for (const f of Array.from(files)) {
      const resized = await resizeImageFile(f);
      fd.append("files", resized);
    }
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setForm((f) => ({ ...f, images: [...f.images, ...data.urls] }));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (url: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
      }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/products");
    } else {
      setError(t("error"));
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 bg-white rounded-xl border border-slate-200 p-6">
      <div>
        <label className="text-sm font-medium block mb-1">{t("productName")} *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">{t("description")}</label>
        <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">{t("price")} (฿) *</label>
          <input type="number" step="0.01" min="0" required value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">{t("stock")} *</label>
          <input type="number" min="0" required value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">{t("category")} *</label>
          <select required value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">{t("images")}</label>

        {form.images.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
            {form.images.map((url, i) => (
              <div key={url} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full rounded-lg object-cover border border-slate-200" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] leading-none px-1.5 py-1 rounded">
                    {t("coverImage")}
                  </span>
                )}
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <XIcon size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed py-6 px-4 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-indigo-400 bg-indigo-50"
              : uploading
              ? "border-slate-200 bg-slate-50 cursor-wait"
              : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
          }`}
        >
          {uploading ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
              <span className="text-sm text-slate-500 mt-1">{t("loading")}</span>
            </>
          ) : (
            <>
              <UploadIcon size={22} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600 mt-1">{t("uploadImages")}</span>
              <span className="text-xs text-slate-400">{t("dropImagesHint")}</span>
              <span className="text-[11px] text-slate-300">{t("imageFileHint")}</span>
              <span className="text-[11px] text-slate-300">{t("recommendedImageSize")}</span>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)}
            className="hidden" />
        </label>
      </div>

      <div className="flex items-center gap-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          {t("active")}
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
          <StarIcon size={14} filled={form.isFeatured} className={form.isFeatured ? "text-amber-400" : "text-slate-400"} />
          {t("markFeatured")}
        </label>
      </div>

      {error && <p className="text-rose-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button disabled={busy || uploading}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          <SaveIcon size={16} />
          {t("save")}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")}
          className="border border-slate-300 px-6 py-2 rounded-lg text-sm hover:bg-slate-50">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
