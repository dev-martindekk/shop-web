"use client";

import { useI18n } from "@/lib/i18n";

const COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  PENDING_VERIFY: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  SHIPPED: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-200 text-slate-500",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORS[status] ?? "bg-slate-100"}`}>
      {t(`st_${status}`)}
    </span>
  );
}
