import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { PublicBuilderDetail } from "../types/public";

interface BuilderStripProps {
  builders: PublicBuilderDetail[];
}

export function BuilderStrip({ builders }: BuilderStripProps) {
  const displayBuilders = builders.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
            Meet Our Builders
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Trusted by top real estate developers.
          </p>
        </div>
        <Link
          href="/builders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark"
        >
          View all builders <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      {displayBuilders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
          Builder profiles will appear here as they are published.
        </div>
      ) : (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayBuilders.map((b) => {
          const initials = b.companyName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
          const rating = b.stats.averageRating?.toFixed(1);
          const projectCount = b.stats.projectsCount;

          return (
            <Link
              key={b.id}
              href={`/builders/${b.slug}`}
              className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-blue font-bold text-sm text-white">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-sm text-slate-900">
                    {b.companyName}
                  </p>
                  <p className="truncate text-xs text-slate-500">{b.city}</p>
                </div>
              </div>

              <div className={`mt-5 grid gap-2 rounded-lg bg-slate-50 p-2.5 text-center ${rating ? "grid-cols-3" : "grid-cols-2"}`}>
                <div>
                  <p className="font-bold text-xs text-slate-900">{projectCount}</p>
                  <p className="text-[10px] text-slate-400">Projects</p>
                </div>
                {b.yearsInBusiness !== null && (
                <div>
                  <p className="font-bold text-xs text-slate-900">{b.yearsInBusiness} yrs</p>
                  <p className="text-[10px] text-slate-400">Experience</p>
                </div>
                )}
                {rating && (
                <div>
                  <p className="flex items-center justify-center gap-1 font-bold text-xs text-slate-900">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    {rating}
                  </p>
                  <p className="text-[10px] text-slate-400">Rating</p>
                </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Profile <ArrowRight size={13} aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </section>
  );
}
