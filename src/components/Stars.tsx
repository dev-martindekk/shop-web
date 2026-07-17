"use client";

export function Stars({
  value,
  size = "text-base",
  onChange,
}: {
  value: number;
  size?: string;
  onChange?: (v: number) => void;
}) {
  return (
    <span className={`inline-flex ${size} leading-none`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={onChange ? () => onChange(i) : undefined}
          className={`${onChange ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
            i <= Math.round(value) ? "text-amber-400" : "text-slate-300"
          }`}
        >
          ★
        </span>
      ))}
    </span>
  );
}
