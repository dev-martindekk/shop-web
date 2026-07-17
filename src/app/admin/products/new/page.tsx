"use client";

import { useI18n } from "@/lib/i18n";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">+ {t("addProduct")}</h1>
      <ProductForm />
    </div>
  );
}
