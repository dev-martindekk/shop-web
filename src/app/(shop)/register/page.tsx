"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";

export default function RegisterPage() {
  const { t } = useI18n();
  const { refresh } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      await refresh();
      router.push("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "emailTaken" ? t("emailTaken") : t("error"));
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white rounded-2xl border border-slate-200 p-6">
      <h1 className="text-xl font-bold text-center mb-5">📝 {t("registerTitle")}</h1>
      <form onSubmit={submit} className="space-y-3">
        <input required value={form.name} onChange={set("name")} placeholder={t("fullName")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input type="email" required value={form.email} onChange={set("email")} placeholder={t("email")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input value={form.phone} onChange={set("phone")} placeholder={t("phone")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input type="password" required minLength={6} value={form.password} onChange={set("password")}
          placeholder={t("password") + " (6+)"}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        {error && <p className="text-rose-500 text-sm">{error}</p>}
        <button disabled={busy}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {t("register")}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-slate-500">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-indigo-600 font-medium">{t("login")}</Link>
      </p>
    </div>
  );
}
