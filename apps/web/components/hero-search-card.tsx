"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, MapPin, Search } from "lucide-react";
import type { City } from "../types/public";

type SearchTab = "BUY" | "RENT" | "PLOTS" | "COMMERCIAL";

interface HeroSearchCardProps {
  cities: City[];
  /** When true, shows the secondary quick-filters row (BHK, budget, etc.) */
  showQuickFilters?: boolean;
  /** Compact styling for search page hero banner */
  compact?: boolean;
  initialCity?: string;
  initialQuery?: string;
}

export function HeroSearchCard({
  cities,
  showQuickFilters = true,
  compact = false,
  initialCity,
  initialQuery = "",
}: HeroSearchCardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>("BUY");
  const [selectedCity, setSelectedCity] = useState(initialCity ?? "");
  const [query, setQuery] = useState(initialQuery);
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");
  const [possession, setPossession] = useState("");
  const [reraOnly, setReraOnly] = useState(false);

  const buildParams = () => {
    const sp = new URLSearchParams();
    if (tab === "PLOTS") sp.set("propertyType", "PLOT");
    if (tab === "COMMERCIAL") sp.set("propertyType", "SHOP,CORPORATE");
    if (tab === "BUY" && propertyType) sp.set("propertyType", propertyType);
    if (selectedCity) sp.set("city", selectedCity);
    if (query.trim()) sp.set("q", query.trim());
    if (budget) sp.set("maxPrice", budget);
    if (bhk) sp.set("bedrooms", bhk === "4+" ? "4,5,6" : bhk);
    if (possession) sp.set("possessionStatus", possession);
    if (reraOnly) sp.set("verifiedOnly", "true");
    return sp;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = buildParams().toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  const tabs: { key: SearchTab; label: string }[] = [
    { key: "BUY", label: "Buy" },
    { key: "RENT", label: "Rent" },
    { key: "PLOTS", label: "Plots" },
    { key: "COMMERCIAL", label: "Commercial" },
  ];

  return (
    <div
      className={`w-full rounded-2xl bg-white text-slate-900 shadow-2xl ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      {/* Tabs Row */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 pb-3 px-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            disabled={key === "RENT"}
            title={key === "RENT" ? "Rental listings are not available yet" : undefined}
            className={`rounded-md px-4 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              tab === key
                ? "bg-ink-blue text-white shadow-sm"
                : "border border-transparent text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Primary Search Row */}
      <form
        onSubmit={handleSearch}
        className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center"
      >
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 lg:w-44 shrink-0">
          <MapPin size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, localities or builders"
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-2.5 text-xs font-bold text-white shadow-accent-button transition-colors hover:bg-accent-dark shrink-0"
        >
          <Search size={15} strokeWidth={2.5} />
          Search
        </button>
      </form>

      {/* Quick Filters Row */}
      {showQuickFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 px-1">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none hover:border-slate-300"
          >
            <option value="">Property Type</option>
            <option value="FLAT">Flat</option>
            <option value="HOUSE">House</option>
            <option value="PLOT">Plot</option>
            <option value="SHOP">Shop</option>
            <option value="CORPORATE">Commercial</option>
          </select>

          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none hover:border-slate-300"
          >
            <option value="">Budget</option>
            <option value="5000000">Under ₹50L</option>
            <option value="10000000">Under ₹1Cr</option>
            <option value="20000000">Under ₹2Cr</option>
            <option value="50000000">Under ₹5Cr</option>
          </select>

          <select
            value={bhk}
            onChange={(e) => setBhk(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none hover:border-slate-300"
          >
            <option value="">BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4+">4+ BHK</option>
          </select>

          <select
            value={possession}
            onChange={(e) => setPossession(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none hover:border-slate-300"
          >
            <option value="">Possession</option>
            <option value="READY">Ready to Move</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
            <option value="UPCOMING">New Launch</option>
          </select>

          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
            <input
              type="checkbox"
              checked={reraOnly}
              onChange={(e) => setReraOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <CircleCheck size={13} />
            RERA Verified
          </label>

          <button
            type="button"
            onClick={() => {
              const queryString = buildParams().toString();
              router.push(queryString ? `/search?${queryString}` : "/search");
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-300"
          >
            More Filters
          </button>
        </div>
      )}
    </div>
  );
}
