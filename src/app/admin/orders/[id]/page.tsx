"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeftIcon,
  BagIcon,
  BankIcon,
  NoteIcon,
  PackageIcon,
  ReceiptIcon,
  TruckIcon,
  UserIcon,
} from "@/components/icons";

type OrderDetail = {
  id: number;
  status: string;
  total: string;
  name: string;
  phone: string;
  address: string;
  note: string | null;
  slipUrl: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string };
  bankAccount: { bankName: string; accountNumber: string } | null;
  items: {
    id: number;
    productName: string;
    price: string;
    quantity: number;
    product: { images: { url: string }[] };
  }[];
};

const ACTIONS: Record<string, { status: string; labelKey: string; style: string }[]> = {
  PENDING_PAYMENT: [
    { status: "PAID", labelKey: "confirmPayment", style: "bg-emerald-600 hover:bg-emerald-700" },
    { status: "CANCELLED", labelKey: "cancelOrder", style: "bg-rose-600 hover:bg-rose-700" },
  ],
  PENDING_VERIFY: [
    { status: "PAID", labelKey: "confirmPayment", style: "bg-emerald-600 hover:bg-emerald-700" },
    { status: "CANCELLED", labelKey: "cancelOrder", style: "bg-rose-600 hover:bg-rose-700" },
  ],
  PAID: [
    { status: "SHIPPED", labelKey: "markShipped", style: "bg-violet-600 hover:bg-violet-700" },
    { status: "CANCELLED", labelKey: "cancelOrder", style: "bg-rose-600 hover:bg-rose-700" },
  ],
  SHIPPED: [
    { status: "COMPLETED", labelKey: "markCompleted", style: "bg-green-600 hover:bg-green-700" },
  ],
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang } = useI18n();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order ?? null));
  }, [id]);

  useEffect(load, [load]);

  if (!order) return <div className="text-slate-400">{t("loading")}</div>;

  const setStatus = async (status: string) => {
    if (status === "CANCELLED" && !confirm(t("confirmDelete"))) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    load();
  };

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";
  const actions = ACTIONS[order.status] ?? [];

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 w-fit">
        <ArrowLeftIcon size={15} />
        {t("orders")}
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3 mt-3 mb-5">
        <h1 className="text-2xl font-bold">
          {t("orderNo")}{order.id} <StatusBadge status={order.status} />
        </h1>
        <div className="flex gap-2">
          {actions.map((a) => (
            <button
              key={a.status}
              disabled={busy}
              onClick={() => setStatus(a.status)}
              className={`text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${a.style}`}
            >
              {t(a.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="flex items-center gap-2 font-bold mb-3">
              <BagIcon size={18} />
              {t("orderItems")}
            </h2>
            <ul className="space-y-2">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 text-sm">
                  {i.product?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.product.images[0].url} alt="" className="w-11 h-11 rounded-lg object-cover bg-slate-100" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                      <PackageIcon size={20} strokeWidth={1.25} />
                    </div>
                  )}
                  <span className="flex-1">{i.productName}</span>
                  <span className="text-slate-500">× {i.quantity}</span>
                  <span className="font-medium">{fmtMoney(parseFloat(i.price) * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between font-bold">
              <span>{t("total")}</span>
              <span className="text-indigo-600 text-lg">{fmtMoney(order.total)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm">
            <h2 className="flex items-center gap-2 font-bold mb-2">
              <UserIcon size={16} />
              {t("buyer")}
            </h2>
            <p>
              {order.user.name} <span className="text-slate-400">({order.user.email})</span>
            </p>
            <h2 className="flex items-center gap-2 font-bold mt-4 mb-2">
              <TruckIcon size={16} />
              {t("shippingTo")}
            </h2>
            <p className="text-slate-600">
              {order.name} · {order.phone}
              <br />
              {order.address}
            </p>
            {order.note && (
              <p className="flex items-center gap-1.5 text-slate-400 mt-2">
                <NoteIcon size={14} />
                {order.note}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-3">
              {new Date(order.createdAt).toLocaleString(dateLocale)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="flex items-center gap-2 font-bold mb-3">
            <ReceiptIcon size={18} />
            {t("viewSlip")}
          </h2>
          {order.bankAccount && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
              <BankIcon size={15} />
              {order.bankAccount.bankName} · {order.bankAccount.accountNumber}
            </p>
          )}
          {order.slipUrl ? (
            <a href={order.slipUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.slipUrl} alt="slip" className="rounded-lg border border-slate-200 max-h-[480px]" />
            </a>
          ) : (
            <p className="text-slate-400 text-sm">{t("noSlip")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
