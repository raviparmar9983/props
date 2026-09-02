"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { City } from "../types/public";
import { BottomSheet } from "./bottom-sheet";
import { PillButton } from "./pill-button";
import { MapPin, ChevronDown, Search } from "lucide-react";

interface CollapsingSearchBarProps {
  cities: City[];
  location?: string;
  compact?: boolean;
  initialQuery?: string;
}

export function CollapsingSearchBar({
  cities,
  location = "",
  compact = false,
  initialQuery = "",
}: CollapsingSearchBarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(compact);
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (compact) return;
    const onScroll = () => setCollapsed(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [compact]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];
    return cities
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, cities]);

  function goToCity(slug: string) {
    router.push(`/search?city=${encodeURIComponent(slug)}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className={`sticky top-0 z-40 w-full bg-paper/90 backdrop-blur-md transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)] md:top-16 ${
          collapsed ? "py-2" : "py-4"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4">
          <form
            onSubmit={submit}
            className={`flex items-center gap-1 rounded-pill bg-surface shadow-card transition-all duration-[var(--duration-base)] ${
              collapsed ? "h-12" : "h-14"
            }`}
          >
            <button
              type="button"
              onClick={() => setCitySheetOpen(true)}
              className={`flex shrink-0 items-center gap-1.5 rounded-pill px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 ${
                collapsed ? "hidden sm:flex" : "flex"
              }`}
              aria-label="Choose location"
            >
              <MapPin size={16} strokeWidth={2.2} className="text-accent" aria-hidden />
              <span className="hidden max-w-28 truncate md:block">
                {location || "All cities"}
              </span>
              <ChevronDown
                size={12}
                strokeWidth={2.5}
                className="hidden text-slate-400 md:block"
                aria-hidden
              />
            </button>

            <div className="hidden h-6 w-px bg-slate-200 md:block" />

            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search projects, cities or builders"
                className="w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-input border border-slate-200 bg-surface shadow-[var(--shadow-card-hover)]">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goToCity(c.slug)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      <MapPin size={14} strokeWidth={2} className="text-slate-400" aria-hidden />
                      {c.name}
                      <span className="ml-auto text-xs text-slate-400">
                        {c.stateName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pr-1.5">
              <PillButton
                type="submit"
                size="sm"
                className="h-10 rounded-pill px-5"
                aria-label="Search"
              >
                {collapsed ? (
                  <Search size={18} strokeWidth={2.2} aria-hidden />
                ) : (
                  <>
                    <Search size={16} strokeWidth={2.2} aria-hidden />
                    Search
                  </>
                )}
              </PillButton>
            </div>
          </form>
        </div>
      </div>

      <BottomSheet
        open={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
        title="Choose location"
        subtitle="Pick a city to browse projects"
      >
        <div className="grid grid-cols-2 gap-2 pb-4">
          <button
            onClick={() => {
              setCitySheetOpen(false);
              router.push("/search");
            }}
            className="rounded-input border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors hover:border-accent/40 hover:text-accent"
          >
            All cities
          </button>
          {cities.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCitySheetOpen(false);
                goToCity(c.slug);
              }}
              className="rounded-input border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors hover:border-accent/40 hover:text-accent"
            >
              {c.name}
              <span className="block text-xs font-normal text-slate-400">
                {c.stateName}
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
