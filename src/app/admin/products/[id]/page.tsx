"use client";

import { use, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ProductForm, ProductFormData } from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [initial, setInitial] = useState<ProductFormData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setInitial({
          name: p.name,
          description: p.description,
          price: String(p.price),
          stock: String(p.stock),
          categoryId: String(p.categoryId),
          isActive: p.isActive,
          images: p.images.map((i: { url: string }) => i.url),
        });
      });
  }, [id]);

  if (!initial) return <div className="text-slate-400">{t("loading")}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">✏️ {t("editProduct")} #{id}</h1>
      <ProductForm productId={parseInt(id)} initial={initial} />
    </div>
  );
}
