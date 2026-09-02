"use client";

import Link from "next/link";
import { ChipRow } from "./filter-chips";
import {
  Building2,
  Store,
  Building,
  Home,
  type LucideIcon,
} from "lucide-react";

const CATEGORIES: {
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
}[] = [
  { label: "Flats", value: "FLAT", hint: "Apartments", Icon: Building2 },
  { label: "Shops", value: "SHOP", hint: "Retail space", Icon: Store },
  { label: "Corporate", value: "CORPORATE", hint: "Offices", Icon: Building },
  { label: "Tenements", value: "TENEMENT", hint: "Compact homes", Icon: Home },
];

export function CategoryTiles() {
  return (
    <ChipRow className="-mx-4 px-4 sm:mx-0 sm:px-0">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.value}
          href={`/search?propertyType=${cat.value}`}
          className="flex w-40 shrink-0 flex-col gap-2.5 rounded-card border border-slate-200 bg-surface p-4 shadow-card transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] hover:border-accent/30 hover:shadow-card-hover active:scale-[0.98] sm:w-44"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-accent-soft text-accent">
            <cat.Icon size={22} strokeWidth={1.8} aria-hidden />
          </span>
          <span>
            <span className="block font-display text-base font-semibold text-slate-900">
              {cat.label}
            </span>
            <span className="block text-xs text-slate-400">{cat.hint}</span>
          </span>
        </Link>
      ))}
    </ChipRow>
  );
}
