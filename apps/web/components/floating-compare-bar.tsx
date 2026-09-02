"use client";

import Link from "next/link";
import { useCompareSelection } from "../lib/compareSelection";
import { CompareDropdown } from "./compare-dropdown";
import { X, GitCompareArrows } from "lucide-react";

export function FloatingCompareBar() {
  const { slugs, remove, clear, count } = useCompareSelection();

  if (count === 0) return null;

  const href =
    count >= 2
      ? `/compare?slugs=${slugs.join(",")}`
      : "#";

  return (
    <div className="animate-fade-rise fixed bottom-20 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-card border border-slate-200 bg-surface px-4 py-3 shadow-card-hover md:bottom-6">
      {/* Thumbnails */}
      <div className="flex -space-x-2">
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
      <span className="text-sm font-medium text-slate-700">
        {count} selected
      </span>

      {/* Add more via search */}
      <div className="relative">
        <CompareDropdown />
      </div>

      {/* Clear button */}
      <button
        type="button"
        onClick={clear}
        aria-label="Clear selection"
        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={14} />
      </button>

      {/* Compare CTA */}
      {count >= 2 ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-sm font-semibold text-white shadow-accent-button hover:bg-accent-dark"
        >
          <GitCompareArrows size={14} />
          Compare
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400">
          <GitCompareArrows size={14} />
          Select 2+
        </span>
      )}
    </div>
  );
}
