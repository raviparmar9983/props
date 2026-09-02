import Link from "next/link";
import { Award, ChevronRight, Star } from "lucide-react";
import { fileUrl } from "../lib/format";
import type { PublicBuilderDetail } from "../types/public";

interface BuilderStripProps {
  builders: PublicBuilderDetail[];
}

function formatRating(rating: number | null): string {
  if (rating === null) return "—";
  return rating % 1 === 0 ? rating.toFixed(1) : rating.toFixed(1);
}

export function BuilderStrip({ builders }: BuilderStripProps) {
  if (builders.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
          Meet our builders
        </h2>
        <Link
          href="/search"
          className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
        >
          Browse projects
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {builders.map((builder) => (
          <Link
            key={builder.id}
            href={`/builders/${builder.slug}`}
            className="w-64 shrink-0 rounded-card border border-slate-200 bg-surface p-4 shadow-card transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] hover:border-accent/40 hover:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              {builder.logo ? (
                <img
                  src={fileUrl(builder.logo) ?? ""}
                  alt={builder.companyName}
                  className="h-11 w-11 rounded-full bg-surface object-contain"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-blue font-display text-base font-bold text-white">
                  {builder.companyName.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-slate-900">
                  {builder.companyName}
                </p>
                <p className="truncate text-xs text-slate-400">{builder.city}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="rounded-input bg-slate-50 px-2 py-2 text-center">
                <p className="font-display text-sm font-bold text-slate-900">
                  {builder.yearsInBusiness ? `${builder.yearsInBusiness}y` : "—"}
                </p>
                <p className="text-[9px] font-semibold tracking-wide text-slate-400 uppercase">
                  Experience
                </p>
              </div>
              <div className="rounded-input bg-slate-50 px-2 py-2 text-center">
                <p className="font-display text-sm font-bold text-slate-900">
                  {builder.stats.projectsCount}
                </p>
                <p className="text-[9px] font-semibold tracking-wide text-slate-400 uppercase">
                  Projects
                </p>
              </div>
              <div className="rounded-input bg-slate-50 px-2 py-2 text-center">
                <p className="inline-flex items-center justify-center gap-0.5 font-display text-sm font-bold text-slate-900">
                  <Star size={11} className="fill-rating-gold text-rating-gold" aria-hidden />
                  {formatRating(builder.stats.averageRating)}
                </p>
                <p className="text-[9px] font-semibold tracking-wide text-slate-400 uppercase">
                  Rating
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {builder.onTimeDeliveryRate !== null ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                  <Award size={12} aria-hidden />
                  {builder.onTimeDeliveryRate}% on-time
                </span>
              ) : (
                <span />
              )}
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent">
                Profile
                <ChevronRight size={13} aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
