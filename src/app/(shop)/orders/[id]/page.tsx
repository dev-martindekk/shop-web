"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";

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
  items: {
    id: number;
    productName: string;
    productId: number;
    price: string;
    quantity: number;
    product: { images: { url: string }[] };
  }[];
};

type Bank = { id: number; bankName: string; accountName: string; accountNumber: string };

function OrderDetailInner({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order ?? null));
  }, [id]);

  useEffect(() => {
    load();
    fetch("/api/bank-accounts")
      .then((r) => r.json())
      .then((d) => {
        setBanks(d.accounts ?? []);
        if (d.accounts?.length) setSelectedBank(d.accounts[0].id);
      });
  }, [load]);

  if (!order) return <div className="text-center py-16 text-slate-400">{t("loading")}</div>;

  const canUpload = order.status === "PENDING_PAYMENT" || order.status === "PENDING_VERIFY";
  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  const uploadSlip = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("slip", file);
    if (selectedBank) fd.append("bankAccountId", String(selectedBank));
    const res = await fetch(`/api/orders/${order.id}/slip`, { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {isNew && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm">
          ✅ {t("orderSuccess")}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg font-bold">
            {t("orderNo")}{order.id}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {new Date(order.createdAt).toLocaleString(dateLocale)}
        </div>

        <ul className="mt-4 space-y-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 text-sm">
              {i.product?.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.product.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">📦</div>
              )}
              <span className="flex-1">{i.productName}</span>
              <span className="text-slate-500">× {i.quantity}</span>
              <span className="font-medium w-24 text-right">{fmtMoney(parseFloat(i.price) * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between font-bold">
          <span>{t("total")}</span>
          <span className="text-indigo-600 text-lg">{fmtMoney(order.total)}</span>
        </div>

        <div className="mt-4 bg-slate-50 rounded-lg p-3 text-sm">
          <div className="font-medium mb-1">🚚 {t("shippingTo")}</div>
          <div className="text-slate-600">
            {order.name} · {order.phone}
            <br />
            {order.address}
            {order.note && (
              <>
                <br />
                <span className="text-slate-400">📝 {order.note}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {canUpload && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-3">💳 {t("payTo")}</h2>
          <div className="space-y-2 mb-4">
            {banks.map((b) => (
              <label
                key={b.id}
                className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer text-sm ${
                  selectedBank === b.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="bank"
                  checked={selectedBank === b.id}
                  onChange={() => setSelectedBank(b.id)}
                />
                <div>
                  <div className="font-medium">🏦 {b.bankName}</div>
                  <div className="text-slate-500">
                    {b.accountName} · <b className="text-slate-700 tracking-wider">{b.accountNumber}</b>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {order.slipUrl && (
            <div className="mb-3">
              <div className="text-sm text-emerald-600 mb-2">✓ {t("slipUploaded")}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.slipUrl} alt="slip" className="max-h-60 rounded-lg border border-slate-200" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="text-sm flex-1" />
            <button
              onClick={uploadSlip}
              disabled={uploading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shrink-0"
            >
              {uploading ? t("loading") : `📤 ${t("submitSlip")}`}
            </button>
          </div>
        </div>
      )}

      {!canUpload && order.slipUrl && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-2">🧾 {t("uploadSlip")}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={order.slipUrl} alt="slip" className="max-h-60 rounded-lg border border-slate-200" />
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <OrderDetailInner id={id} />
    </Suspense>
  );
}
