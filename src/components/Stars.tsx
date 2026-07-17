"use client";

import { StarIcon } from "@/components/icons";

export function Stars({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5 leading-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={onChange ? () => onChange(i) : undefined}
          className={onChange ? "cursor-pointer hover:scale-110 transition-transform" : ""}
        >
          <StarIcon
            size={size}
            strokeWidth={1.5}
            filled={i <= Math.round(value)}
            className={i <= Math.round(value) ? "text-amber-400" : "text-slate-300"}
          />
        </span>
      ))}
    </span>
  );
}
