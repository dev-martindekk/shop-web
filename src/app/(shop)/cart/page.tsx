"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useUser } from "@/lib/user";
import { ArrowRightIcon, BagIcon, PackageIcon, XIcon } from "@/components/icons";

export default function CartPage() {
  const { t } = useI18n();
  const { items, loaded, updateQty, remove, total } = useCart();
  const { user } = useUser();
  const router = useRouter();

  if (!loaded) return <div className="text-center py-16 text-slate-400">{t("loading")}</div>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16">
        <BagIcon size={44} strokeWidth={1.25} className="text-slate-300 mb-3" />
        <p className="text-slate-400 mb-4">{t("cartEmpty")}</p>
        <Link href="/" className="flex items-center gap-1 text-indigo-600 font-medium">
          {t("continueShopping")} <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="flex items-center gap-2 text-xl font-bold mb-5">
        <BagIcon size={22} />
        {t("cartTitle")}
      </h1>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 p-4">
            <Link href={`/products/${item.productId}`} className="shrink-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                  <PackageIcon size={26} strokeWidth={1.25} />
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.productId}`} className="text-sm font-medium line-clamp-1 hover:text-indigo-600">
                {item.name}
              </Link>
              <div className="text-indigo-600 font-bold mt-0.5">{fmtMoney(item.price)}</div>
            </div>
            <div className="flex items-center border border-slate-300 rounded-lg text-sm">
              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-2.5 py-1 hover:bg-slate-100">−</button>
              <span className="px-3 min-w-[2.5rem] text-center">{item.quantity}</span>
              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-2.5 py-1 hover:bg-slate-100">+</button>
            </div>
            <div className="w-24 text-right font-semibold text-sm hidden sm:block">
              {fmtMoney(item.price * item.quantity)}
            </div>
            <button onClick={() => remove(item.productId)} className="text-rose-400 hover:text-rose-600 px-1" title={t("remove")}>
              <XIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-lg">
          {t("total")}: <b className="text-indigo-600">{fmtMoney(total)}</b>
        </div>
        <button
          onClick={() => router.push(user ? "/checkout" : "/login")}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700"
        >
          {t("checkout")} <ArrowRightIcon size={16} />
        </button>
      </div>
    </div>
  );
}
