"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";
import {
  BankIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  NoteIcon,
  PackageIcon,
  ReceiptIcon,
  TruckIcon,
  UploadIcon,
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
  items: {
    id: number;
    productName: string;
    productId: number;
    price: string;
    quantity: number;
    product: { images: { url: string }[] };
  }[];
};

type Bank = { id: number; bankName: string; accountName: string; accountNumber: string; qrCodeUrl: string | null };

function OrderDetailInner({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

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
    if (!selectedFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("slip", selectedFile);
    if (selectedBank) fd.append("bankAccountId", String(selectedBank));
    const res = await fetch(`/api/orders/${order.id}/slip`, { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      setSelectedFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileRef.current) fileRef.current.value = "";
      load();
    }
  };

  const copyAccountNumber = async (e: React.MouseEvent, b: Bank) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(b.accountNumber);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId((id) => (id === b.id ? null : id)), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {isNew && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm">
          <CheckCircleIcon size={18} className="shrink-0" />
          {t("orderSuccess")}
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
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                  <PackageIcon size={22} strokeWidth={1.25} />
                </div>
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
          <div className="flex items-center gap-1.5 font-medium mb-1">
            <TruckIcon size={16} />
            {t("shippingTo")}
          </div>
          <div className="text-slate-600">
            {order.name} · {order.phone}
            <br />
            {order.address}
            {order.note && (
              <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                <NoteIcon size={14} />
                {order.note}
              </div>
            )}
          </div>
        </div>
      </div>

      {canUpload && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="flex items-center gap-2 font-bold mb-3">
            <CreditCardIcon size={18} />
            {t("payTo")}
          </h2>
          <div className="space-y-2 mb-4">
            {banks.map((b) => (
              <label
                key={b.id}
                className={`flex flex-col gap-3 border rounded-xl p-4 cursor-pointer text-sm ${
                  selectedBank === b.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="bank"
                    checked={selectedBank === b.id}
                    onChange={() => setSelectedBank(b.id)}
                  />
                  <div className="flex items-center gap-1.5 font-medium">
                    <BankIcon size={16} className="text-slate-500" />
                    {b.bankName}
                  </div>
                </div>

                {b.qrCodeUrl && (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.qrCodeUrl}
                      alt="qr"
                      className="w-48 h-48 rounded-lg object-cover border border-slate-200"
                    />
                    <a
                      href={b.qrCodeUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      <DownloadIcon size={13} />
                      {t("saveQrCode")}
                    </a>
                  </div>
                )}

                <div className="text-slate-500 flex items-center justify-center gap-1.5 flex-wrap text-center">
                  {b.accountName} · <b className="text-slate-700 tracking-wider">{b.accountNumber}</b>
                  <button
                    type="button"
                    onClick={(e) => copyAccountNumber(e, b)}
                    className={`flex items-center gap-1 text-xs ${
                      copiedId === b.id ? "text-emerald-600" : "text-slate-400 hover:text-indigo-600"
                    }`}
                    title={t("copy")}
                  >
                    {copiedId === b.id ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    {copiedId === b.id ? t("copied") : t("copy")}
                  </button>
                </div>
              </label>
            ))}
          </div>

          {order.slipUrl && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-sm text-emerald-600 mb-2">
                <CheckIcon size={15} />
                {t("slipUploaded")}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.slipUrl} alt="slip" className="max-h-60 rounded-lg border border-slate-200" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
                  <ReceiptIcon size={22} strokeWidth={1.25} />
                </div>
              )}
              <label className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg px-3.5 py-2 cursor-pointer hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                <UploadIcon size={15} />
                {selectedFile ? t("changeFile") : t("chooseSlipFile")}
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickFile(e.target.files)} className="hidden" />
              </label>
              {selectedFile && (
                <span className="text-xs text-slate-500 truncate max-w-[160px]">{selectedFile.name}</span>
              )}
            </div>
            <button
              onClick={uploadSlip}
              disabled={uploading || !selectedFile}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? t("loading") : (<><UploadIcon size={16} />{t("submitSlip")}</>)}
            </button>
          </div>
        </div>
      )}

      {!canUpload && order.slipUrl && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="flex items-center gap-2 font-bold mb-2">
            <ReceiptIcon size={18} />
            {t("uploadSlip")}
          </h2>
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
