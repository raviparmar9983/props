import type { PublicStats } from "../types/public";

export function StatsBar({ stats }: { stats: PublicStats }) {
  const items = [
    { value: `${stats.verifiedBuilders.toLocaleString("en-IN")}+`, label: "Verified builders" },
    { value: `${stats.projects.toLocaleString("en-IN")}+`, label: "Properties" },
    { value: `${stats.cities.toLocaleString("en-IN")}`, label: "Cities" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-card border border-slate-200 bg-surface py-5 shadow-card">
        {items.map((item) => (
          <div key={item.label} className="px-2 text-center">
            <p className="font-display text-xl font-bold text-ink-blue md:text-3xl">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400 md:text-xs">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
