"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { suggestProjects } from "../lib/api/publicProjects";
import { useCompareSelection } from "../lib/compareSelection";
import { formatPrice } from "../lib/format";
import { GitCompareArrows, Search, MapPin, X } from "lucide-react";

interface CompareDropdownProps {
  currentSlug?: string;
  className?: string;
  /** Icon-only trigger with no label — for tight spaces like the floating compare bar. */
  compact?: boolean;
  /** Open the results panel above the trigger instead of below — for triggers pinned near the bottom of the screen. */
  openUp?: boolean;
}

export function CompareDropdown({ currentSlug, className, compact, openUp }: CompareDropdownProps) {
  const router = useRouter();
  const { slugs, toggle, count } = useCompareSelection();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [] } = useQuery({
    queryKey: ["suggest", query],
    queryFn: () => suggestProjects(query, 6),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });

  const filtered = results.filter((r) => r.slug !== currentSlug);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlight(0);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  useEffect(() => {
    setHighlight(0);
  }, [filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && filtered[highlight]) {
      e.preventDefault();
      handleSelect(filtered[highlight].slug);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const handleSelect = (slug: string) => {
    const alreadySelected = slugs.includes(slug);
    if (!alreadySelected) {
      if (count >= 3) {
        close();
        return;
      }
      const { rejected } = toggle(slug);
      if (rejected) {
        close();
        return;
      }
    }
    close();
    router.push(
      `/compare?slugs=${[...new Set([...slugs, slug])].join(",")}`,
    );
  };

  const isAlreadySelected = (slug: string) => slugs.includes(slug);

  return (
    <div ref={wrapperRef} className={className}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-label={count >= 2 ? `Compare (${count})` : "Add a property to compare"}
        className={
          compact
            ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            : "inline-flex items-center gap-1.5 rounded-pill border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-300"
        }
      >
        <GitCompareArrows size={compact ? 15 : 13} />
        {!compact && (count >= 2 ? `Compare (${count})` : "Compare with...")}
      </button>

      {open && (
        <div
          className={
            compact
              // Anchored to the viewport, not the small trigger button — the
              // button can sit anywhere inside a narrow floating bar, so a
              // button-relative panel this wide would overflow off-screen.
              ? "fixed inset-x-3 bottom-[calc(132px+env(safe-area-inset-bottom))] z-50 overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card-hover"
              : `absolute right-0 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card-hover ${
                  openUp ? "bottom-full mb-1" : "top-full mt-1"
                }`
          }
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, city, or locality..."
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {query.trim().length < 2 && (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                Type at least 2 characters to search
              </div>
            )}

            {query.trim().length >= 2 && filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No projects found
              </div>
            )}

            {filtered.map((project, i) => {
              const selected = isAlreadySelected(project.slug);
              return (
                <button
                  key={project.slug}
                  type="button"
                  onClick={() => handleSelect(project.slug)}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                    i === highlight ? "bg-accent-soft/50" : "hover:bg-slate-50"
                  } ${selected ? "opacity-60" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {project.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={10} />
                      {project.locality}, {project.city}
                    </p>
                    {project.startingPrice && (
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {formatPrice(project.startingPrice)}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <span className="mt-1 shrink-0 rounded-pill bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                      Added
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          {count >= 2 && (
            <div className="border-t border-slate-100 px-3 py-2 text-center">
              <button
                type="button"
                onClick={() => {
                  close();
                  router.push(`/compare?slugs=${slugs.join(",")}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark"
              >
                <GitCompareArrows size={12} />
                Compare {count} selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
