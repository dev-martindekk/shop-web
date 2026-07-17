"use client";

import Link from "next/link";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { Stars } from "./Stars";
import { PackageIcon } from "@/components/icons";

export type ProductListItem = {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image: string | null;
  category: string;
  sold: number;
  rating: number;
  reviewCount: number;
};

export function ProductCard({ p }: { p: ProductListItem }) {
  const { t } = useI18n();
  return (
    <Link
      href={`/products/${p.id}`}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
    >
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <PackageIcon size={40} strokeWidth={1.25} />
          </div>
        )}
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs px-3 py-1 rounded-full">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-[11px] text-indigo-500 mb-0.5">{p.category}</div>
        <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</div>
        <div className="text-lg font-bold text-indigo-600 mt-1">{fmtMoney(p.price)}</div>
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Stars value={p.rating} size={12} />
            {p.reviewCount > 0 && <span>({p.reviewCount})</span>}
          </span>
          <span>
            {t("sold")} {p.sold}
          </span>
        </div>
      </div>
    </Link>
  );
}
