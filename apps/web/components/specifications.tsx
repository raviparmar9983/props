import type { ReactNode } from "react";
import { Accordion } from "./accordion";
import type { SpecificationItem } from "../types/public";

interface SpecificationsProps {
  items: SpecificationItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  FLOORING: "Flooring",
  KITCHEN: "Kitchen",
  BATHROOM: "Bathrooms & fittings",
  DOORS_WINDOWS: "Doors & windows",
  ELECTRICAL: "Electrical",
  PAINT: "Paint & finishes",
  OTHER: "Other specifications",
};

export function Specifications({ items }: SpecificationsProps) {
  if (items.length === 0) return null;

  const grouped = new Map<string, SpecificationItem[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const accordionItems = [...grouped.entries()].map(([category, rows]) => ({
    id: category,
    title: CATEGORY_LABELS[category] ?? category.replace(/_/g, " "),
    content: (
      <dl className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-start justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0"
          >
            <dt className="text-slate-600">{row.label}</dt>
            <dd className="text-right font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    ) as ReactNode,
  }));

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        Specifications
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Materials and finishes across the project
      </p>
      <div className="mt-3">
        <Accordion items={accordionItems} defaultOpenId={accordionItems[0]?.id ?? null} />
      </div>
    </section>
  );
}
