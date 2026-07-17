"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n, fmtMoney } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useUser } from "@/lib/user";
import { Stars } from "@/components/Stars";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  FlameIcon,
  PackageIcon,
  StarIcon,
  XIcon,
} from "@/components/icons";

type ProductDetail = {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  images: string[];
  sold: number;
  rating: number;
  reviewCount: number;
  reviews: {
    id: number;
    rating: number;
    comment: string | null;
    userName: string;
    createdAt: string;
  }[];
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang } = useI18n();
  const { add } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setProduct(d.product))
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(load, [load]);

  if (notFound) return <div className="text-center py-16 text-slate-400">{t("noProducts")}</div>;
  if (!product) return <div className="text-center py-16 text-slate-400">{t("loading")}</div>;

  const addToCart = () => {
    add(
      {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.images[0] ?? null,
        stock: product.stock,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const buyNow = () => {
    add(
      {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.images[0] ?? null,
        stock: product.stock,
      },
      qty
    );
    router.push("/checkout");
  };

  const submitReview = async () => {
    setReviewMsg(null);
    if (!user) {
      setReviewMsg({ ok: false, text: t("mustLoginToReview") });
      return;
    }
    const res = await fetch(`/api/products/${product.id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: myRating, comment: myComment }),
    });
    if (res.ok) {
      setReviewMsg({ ok: true, text: t("reviewSaved") });
      setMyComment("");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setReviewMsg({
        ok: false,
        text: data.error === "mustPurchaseToReview" ? t("mustPurchaseToReview") : t("error"),
      });
    }
  };

  const dateLocale = lang === "th" ? "th-TH" : lang === "lo" ? "lo-LA" : "en-GB";

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4">
        <ArrowLeftIcon size={16} />
        {t("home")}
      </button>

      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl border border-slate-200 p-6">
        <div>
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
            {product.images[imgIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <PackageIcon size={64} strokeWidth={1.25} />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 ${
                    i === imgIdx ? "border-indigo-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-indigo-500 mb-1">{product.category}</div>
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Stars value={product.rating} />
              <b className="text-slate-700">{product.rating ? product.rating.toFixed(1) : "-"}</b>
              <span>
                ({product.reviewCount} {t("reviews")})
              </span>
            </span>
            <span className="flex items-center gap-1 border-l border-slate-300 pl-3">
              <FlameIcon size={14} className="text-orange-400" />
              {t("sold")} <b className="text-slate-700">{product.sold}</b> {t("pieces")}
            </span>
          </div>

          <div className="text-3xl font-extrabold text-indigo-600 mt-4">{fmtMoney(product.price)}</div>

          <div className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckIcon size={15} />
                {t("inStock")} ({t("stock")} {product.stock})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500">
                <XIcon size={15} />
                {t("outOfStock")}
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-lg shrink-0">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1.5 hover:bg-slate-100">−</button>
                  <span className="px-4 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-1.5 hover:bg-slate-100">+</button>
                </div>
                <button
                  onClick={addToCart}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold border transition-colors ${
                    added
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {added ? (<><CheckIcon size={18} />{t("addedToCart")}</>) : (<><CartIcon size={18} />{t("addToCart")}</>)}
                </button>
              </div>
              <button
                onClick={buyNow}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                {t("buyNow")}
                <ArrowRightIcon size={18} />
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100">
            <h2 className="font-semibold mb-2">{t("description")}</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
        <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
          <StarIcon size={18} filled className="text-amber-400" />
          {t("reviews")} ({product.reviewCount})
        </h2>

        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <div className="font-medium text-sm mb-2">{t("writeReview")}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-slate-500">{t("yourRating")}:</span>
            <Stars value={myRating} size={24} onChange={setMyRating} />
          </div>
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder={t("comment")}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={submitReview}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
            >
              {t("submitReview")}
            </button>
            {reviewMsg && (
              <span className={`text-sm ${reviewMsg.ok ? "text-emerald-600" : "text-rose-500"}`}>
                {reviewMsg.text}
              </span>
            )}
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-slate-400 text-sm">{t("noReviews")}</p>
        ) : (
          <ul className="space-y-4">
            {product.reviews.map((r) => (
              <li key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                    {r.userName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{r.userName}</div>
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} size={12} />
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-slate-600 mt-1.5 ml-10">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
