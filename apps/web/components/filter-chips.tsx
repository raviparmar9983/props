"use client";

import type { ReactNode } from "react";

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  leading?: ReactNode;
  count?: number | undefined;
  disabled?: boolean;
}

export function Chip({ label, active, onClick, leading, count, disabled }: ChipProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-[150ms] ease-[var(--ease-spring)] active:scale-[0.97] ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60"
          : active
            ? "border-accent bg-accent text-white shadow-accent-button"
            : "border-slate-200 bg-surface text-slate-600 hover:border-accent/40 hover:text-accent"
      }`}
    >
      {leading}
      {label}
      {count !== undefined && (
        <span
          className={`rounded-pill px-1.5 text-xs font-semibold ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function ChipRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`no-scrollbar flex gap-2 overflow-x-auto py-1 ${className}`}
      role="list"
    >
      {children}
    </div>
  );
}
