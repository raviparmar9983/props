"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompareSelection } from "../lib/compareSelection";
import { CompareDropdown } from "./compare-dropdown";
import { X, GitCompareArrows } from "lucide-react";

export function FloatingCompareBar() {
  const pathname = usePathname();
  const { slugs, clear, count } = useCompareSelection();

  // The /compare page already has its own "N selected" header + "Add more"
  // link, so showing this floating bar there too is redundant clutter.
  if (count === 0 || pathname?.startsWith("/compare")) return null;

  const href =
    count >= 2
      ? `/compare?slugs=${slugs.join(",")}`
      : "#";

  return (
    <div className="animate-fade-rise fixed bottom-[calc(60px+env(safe-area-inset-bottom)+12px)] left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 flex-nowrap items-center gap-1.5 rounded-card border border-slate-200 bg-surface px-2.5 py-2 shadow-card-hover sm:w-[calc(100%-2rem)] sm:gap-3 sm:px-4 sm:py-3 md:bottom-6">
      {/* Thumbnails — desktop/tablet only, mobile stays compact */}
      <div className="hidden shrink-0 -space-x-2 sm:flex">
        {slugs.map((slug) => (
          <span
            key={slug}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-slate-100 text-[10px] font-semibold text-slate-500"
          >
            {slug.slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>

      {/* Count */}
      <span className="min-w-0 shrink-0 text-xs font-medium text-slate-700 sm:text-sm">
        {count} selected
      </span>

      {/* Add more via search — icon-only on mobile, full label from sm up */}
      <div className="relative shrink-0 sm:hidden">
        <CompareDropdown compact openUp />
      </div>
      <div className="relative hidden shrink-0 sm:block">
        <CompareDropdown openUp />
      </div>

      {/* Clear button */}
      <button
        type="button"
        onClick={clear}
        aria-label="Clear selection"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={14} />
      </button>

      {/* Compare CTA */}
      <div className="ml-auto shrink-0">
        {count >= 2 ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-accent-button transition-colors hover:bg-accent-dark sm:px-4 sm:py-2 sm:text-sm"
          >
            <GitCompareArrows size={14} />
            Compare
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 sm:px-4 sm:py-2 sm:text-sm">
            <GitCompareArrows size={14} />
            Select 2+
          </span>
        )}
      </div>
    </div>
  );
}
