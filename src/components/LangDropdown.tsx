"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, Lang } from "@/lib/i18n";
import { ChevronDownIcon, GlobeIcon } from "@/components/icons";

const LANGS: { code: Lang; label: string }[] = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "English" },
  { code: "lo", label: "ລາວ" },
];

export function LangDropdown({ variant = "light", openUp = false }: { variant?: "light" | "dark"; openUp?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const dark = variant === "dark";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        <GlobeIcon size={14} />
        {current.label}
        <ChevronDownIcon size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`absolute right-0 w-32 rounded-lg border shadow-lg overflow-hidden z-50 ${
            openUp ? "bottom-full mb-1" : "mt-1"
          } ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                lang === l.code
                  ? "bg-indigo-600 text-white"
                  : dark
                  ? "text-slate-300 hover:bg-slate-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
