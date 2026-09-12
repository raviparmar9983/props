import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import type { PublicBuilder } from "../types/public";

export function BuildersDirectory({ builders }: { builders: PublicBuilder[] }) {
  if (builders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-500">
        No builder profiles have been published yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {builders.map((builder) => {
        const initials = builder.companyName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <Link
            key={builder.id}
            href={`/builders/${builder.slug}`}
            className="group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover"
          >
            <div className="flex items-center gap-4">
              {builder.logo ? (
                <img
                  src={builder.logo}
                  alt={`${builder.companyName} logo`}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 rounded-xl border border-slate-100 object-contain p-1"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-blue text-sm font-bold text-white">
                  {initials || <Building2 size={22} aria-hidden />}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-ink-blue">{builder.companyName}</h2>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
                  <ShieldCheck size={14} aria-hidden /> Verified builder
                </p>
              </div>
            </div>

            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:text-accent-dark">
              View builder profile <ArrowRight size={16} aria-hidden />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
