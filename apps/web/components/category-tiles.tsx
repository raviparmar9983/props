"use client";

import Link from "next/link";
import {
  Building2,
  Building,
  House,
  MapPin,
  Store,
  type LucideIcon,
} from "lucide-react";

const CATEGORIES: {
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
}[] = [
  { label: "Flats", value: "FLAT", hint: "Apartments", Icon: Building2 },
  { label: "Houses", value: "HOUSE", hint: "Independent Homes", Icon: House },
  { label: "Plots", value: "PLOT", hint: "Residential & Commercial", Icon: MapPin },
  { label: "Shops", value: "SHOP", hint: "Retail Spaces", Icon: Store },
  { label: "Commercial", value: "CORPORATE", hint: "Offices & Spaces", Icon: Building },
];

export function CategoryTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.label}
          href={`/search?propertyType=${cat.value}`}
          className="flex flex-col items-center text-center justify-center rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-200 hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-ink-blue">
            <cat.Icon size={24} strokeWidth={1.8} aria-hidden />
          </div>
          <p className="font-bold text-sm text-slate-900">{cat.label}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{cat.hint}</p>
        </Link>
      ))}
    </div>
  );
}

