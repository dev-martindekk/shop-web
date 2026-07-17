"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";

export default function LoginPage() {
  const { t } = useI18n();
  const { refresh } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      await refresh();
      router.push(data.user.role === "ADMIN" ? "/admin" : "/");
    } else {
      setError(t("invalidCredentials"));
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white rounded-2xl border border-slate-200 p-6">
      <h1 className="text-xl font-bold text-center mb-5">🔑 {t("loginTitle")}</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("password")}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        {error && <p className="text-rose-500 text-sm">{error}</p>}
        <button
          disabled={busy}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {t("login")}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-slate-500">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-indigo-600 font-medium">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
