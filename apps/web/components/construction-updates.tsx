import { HardHat, TrendingUp } from "lucide-react";
import { fileUrl } from "../lib/format";
import type { ConstructionUpdate } from "../types/public";

interface ConstructionUpdatesProps {
  items: ConstructionUpdate[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ConstructionUpdates({ items }: ConstructionUpdatesProps) {
  if (items.length === 0) return null;

  const latestProgress =
    [...items]
      .filter((u) => u.progressPercent !== null)
      .sort((a, b) => +new Date(b.updateDate) - +new Date(a.updateDate))[0]
      ?.progressPercent ?? null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
          Construction updates
        </h2>
        {latestProgress !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
            <TrendingUp size={13} aria-hidden />
            {latestProgress}% complete
          </span>
        )}
      </div>
      <div className="mt-4 space-y-4">
        {items.map((update) => (
          <article
            key={update.id}
            className="rounded-card border border-slate-200 bg-surface p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              {update.photoUrl ? (
                <img
                  src={fileUrl(update.photoUrl) ?? ""}
                  alt={update.title}
                  className="h-16 w-16 shrink-0 rounded-image object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-image bg-accent-soft text-accent">
                  <HardHat size={22} aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {update.title}
                  </p>
                  <span className="text-xs text-slate-400">
                    {formatDate(update.updateDate)}
                  </span>
                </div>
                {update.progressPercent !== null && (
                  <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-pill bg-slate-100">
                    <div
                      className="h-full rounded-pill bg-success"
                      style={{ width: `${Math.min(100, Math.max(0, update.progressPercent))}%` }}
                    />
                  </div>
                )}
                {update.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {update.description}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
