"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { ProductCard, ProductListItem } from "@/components/ProductCard";

type Category = { id: number; name: string; slug: string; productCount: number };

export function HomeClient() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<ProductListItem[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    setProducts(null);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []));
  }, [q, category]);

  const selectCategory = (slug: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("category", slug);
    router.push(`/?${params}`);
  };

  return (
    <div>
      {!q && !category && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">EZShop 🛒</h1>
          <p className="mt-1 text-indigo-100">
            {t("appName") === "EZShop" ? "" : ""}
            {t("searchPlaceholder").replace("...", "")} · {t("categories")} ·{" "}
            {t("bankTransfer")}
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => selectCategory("")}
          className={`px-3.5 py-1.5 rounded-full text-sm border ${
            !category
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white border-slate-300 hover:border-indigo-400"
          }`}
        >
          {t("all")}
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => selectCategory(c.slug)}
            className={`px-3.5 py-1.5 rounded-full text-sm border ${
              category === c.slug
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white border-slate-300 hover:border-indigo-400"
            }`}
          >
            {c.name} <span className="opacity-60">({c.productCount})</span>
          </button>
        ))}
      </div>

      {q && (
        <p className="mb-4 text-sm text-slate-500">
          🔍 &quot;{q}&quot;
        </p>
      )}

      {products === null ? (
        <div className="text-center py-16 text-slate-400">{t("loading")}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">{t("noProducts")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
