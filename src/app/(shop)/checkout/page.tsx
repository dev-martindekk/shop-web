"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useUser } from "@/lib/user";
import { CheckIcon, CreditCardIcon, MapPinIcon, PlusIcon, TruckIcon } from "@/components/icons";

type Address = {
  id: number;
  label: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { t } = useI18n();
  const { items, loaded: cartLoaded, total, clear } = useCart();
  const { user, loading } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new" | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");

  const loadAddresses = useCallback(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        const list: Address[] = d.addresses ?? [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          setSelectedAddressId(def.id);
          setForm((f) => ({ ...f, name: def.name, phone: def.phone, address: def.address }));
        } else {
          setSelectedAddressId("new");
        }
      });
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        phone: f.phone || user.phone || "",
        address: f.address || user.address || "",
      }));
      loadAddresses();
    }
  }, [user, loading, router, loadAddresses]);

  useEffect(() => {
    if (cartLoaded && items.length === 0 && !busy) router.replace("/cart");
  }, [items, cartLoaded, busy, router]);

  const selectAddress = (a: Address) => {
    setSelectedAddressId(a.id);
    setForm((f) => ({ ...f, name: a.name, phone: a.phone, address: a.address }));
  };

  const selectNewAddress = () => {
    setSelectedAddressId("new");
    setForm((f) => ({ ...f, name: "", phone: "", address: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    if (selectedAddressId === "new" && saveAddress && addressLabel.trim()) {
      await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addressLabel,
          name: form.name,
          phone: form.phone,
          address: form.address,
          isDefault: addresses.length === 0,
        }),
      }).catch(() => {});
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...form,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      clear();
      router.push(`/orders/${data.order.id}?new=1`);
    } else {
      setBusy(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error === "notEnoughStock" ? `${t("notEnoughStock")}: ${data.product ?? ""}` : t("error"));
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-3xl mx-auto grid md:grid-cols-5 gap-6">
      <form onSubmit={submit} className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 space-y-3 h-fit">
        <h1 className="flex items-center gap-2 text-lg font-bold mb-2">
          <TruckIcon size={20} />
          {t("shippingInfo")}
        </h1>

        {addresses.length > 0 && (
          <div className="space-y-2 mb-1">
            <div className="text-xs font-medium text-slate-500">{t("savedAddresses")}</div>
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex items-start gap-2.5 border rounded-xl p-3 cursor-pointer text-sm ${
                  selectedAddressId === a.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="mt-0.5"
                  checked={selectedAddressId === a.id}
                  onChange={() => selectAddress(a)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPinIcon size={14} className="text-slate-500" />
                    {a.label}
                    {a.isDefault && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5">
                        {t("defaultAddress")}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">
                    {a.name} · {a.phone} · {a.address}
                  </div>
                </div>
              </label>
            ))}
            <label
              className={`flex items-center gap-2.5 border rounded-xl p-3 cursor-pointer text-sm ${
                selectedAddressId === "new" ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="savedAddress"
                checked={selectedAddressId === "new"}
                onChange={selectNewAddress}
              />
              <span className="flex items-center gap-1.5 font-medium">
                <PlusIcon size={14} />
                {t("addNewAddress")}
              </span>
            </label>
          </div>
        )}

        <input required value={form.name} onChange={set("name")} placeholder={t("fullName")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input required value={form.phone} onChange={set("phone")} placeholder={t("phone")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <textarea required value={form.address} onChange={set("address")} placeholder={t("address")} rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <textarea value={form.note} onChange={set("note")} placeholder={t("note")} rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />

        {selectedAddressId === "new" && (
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
              {t("saveThisAddress")}
            </label>
            {saveAddress && (
              <input required value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)}
                placeholder={t("addressLabel")}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
            )}
          </div>
        )}

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800">
          <CreditCardIcon size={18} className="shrink-0" />
          {t("paymentMethod")}: <b>{t("bankTransfer")}</b>
        </div>

        {error && <p className="text-rose-500 text-sm">{error}</p>}
        <button disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {busy ? t("loading") : (<><CheckIcon size={18} />{t("placeOrder")}</>)}
        </button>
      </form>

      <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
        <h2 className="font-bold mb-3">{t("orderItems")}</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1">{i.name} × {i.quantity}</span>
              <span className="font-medium shrink-0">{fmtMoney(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold">
          <span>{t("total")}</span>
          <span className="text-indigo-600">{fmtMoney(total)}</span>
        </div>
      </div>
    </div>
  );
}
