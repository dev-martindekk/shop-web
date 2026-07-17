"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, fmtMoney } from "@/lib/i18n";

type ProductRow = {
  id: number;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
  category: { name: string };
  images: { url: string }[];
  _count: { orderItems: number; reviews: number };
};

export default function AdminProductsPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<ProductRow[] | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []));
  }, []);

  useEffect(load, [load]);

  const del = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  const toggleActive = async (p: ProductRow) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">🏷️ {t("products")}</h1>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + {t("addProduct")}
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="p-3"></th>
              <th className="p-3">{t("productName")}</th>
              <th className="p-3">{t("category")}</th>
              <th className="p-3">{t("price")}</th>
              <th className="p-3">{t("stock")}</th>
              <th className="p-3">{t("status")}</th>
              <th className="p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products === null ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400">{t("loading")}</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs">📦</div>
                    )}
                  </td>
                  <td className="p-3 font-medium max-w-[240px]">
                    <div className="line-clamp-2">{p.name}</div>
                  </td>
                  <td className="p-3 text-slate-500">{p.category.name}</td>
                  <td className="p-3 font-medium">{fmtMoney(p.price)}</td>
                  <td className="p-3">
                    <span className={p.stock === 0 ? "text-rose-500 font-medium" : ""}>{p.stock}</span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {p.isActive ? t("active") : t("inactive")}
                    </button>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}`} className="text-indigo-600 hover:underline text-xs font-medium mr-3">
                      ✏️ {t("edit")}
                    </Link>
                    <button onClick={() => del(p.id)} className="text-rose-500 hover:underline text-xs font-medium">
                      🗑️ {t("delete")}
                    </button>
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
