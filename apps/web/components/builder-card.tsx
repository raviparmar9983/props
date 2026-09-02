import Link from "next/link";
import { Award, Briefcase, Building2, ChevronRight, Star } from "lucide-react";
import { VerifiedBadge } from "./verified-badge";
import { fileUrl } from "../lib/format";

interface BuilderCardProps {
  builder: {
    id: string;
    companyName: string;
    slug: string;
    logo: string | null;
    verificationStatus: string;
    yearsInBusiness: number | null;
    totalProjectsCompleted: number | null;
    onTimeDeliveryRate: number | null;
    reviewsSummary: { averageRating: number | null; count: number };
  };
}

function formatRating(rating: number | null): string {
  if (rating === null) return "—";
  return rating % 1 === 0 ? rating.toFixed(1) : rating.toFixed(1);
}

export function BuilderCard({ builder }: BuilderCardProps) {
  const verified = builder.verificationStatus === "VERIFIED";

  const stats: { icon: typeof Award; label: string; value: string }[] = [
    {
      icon: Briefcase,
      label: "Years in business",
      value: builder.yearsInBusiness ? `${builder.yearsInBusiness} years` : "—",
    },
    {
      icon: Building2,
      label: "Projects completed",
      value:
        builder.totalProjectsCompleted !== null
          ? `${builder.totalProjectsCompleted}`
          : "—",
    },
    {
      icon: Award,
      label: "On-time delivery",
      value:
        builder.onTimeDeliveryRate !== null
          ? `${builder.onTimeDeliveryRate}%`
          : "—",
    },
  ];

  const ratingCount = builder.reviewsSummary?.count ?? 0;
  const avgRating = builder.reviewsSummary?.averageRating ?? null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        About the builder
      </h2>
      <div className="mt-3 rounded-card border border-slate-200 bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          {builder.logo ? (
            <img
              src={fileUrl(builder.logo) ?? ""}
              alt={builder.companyName}
              className="h-12 w-12 rounded-full bg-surface object-contain"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-blue font-display text-lg font-bold text-white">
              {builder.companyName.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-slate-900">
              {builder.companyName}
            </p>
            {verified && (
              <span className="mt-0.5 inline-flex items-center gap-1">
                <VerifiedBadge showLabel size={12} />
                <span className="text-xs font-medium text-[#9A6B12]">
                  Verified builder
                </span>
              </span>
            )}
            {ratingCount > 0 && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Star size={12} className="fill-rating-gold text-rating-gold" aria-hidden />
                {formatRating(avgRating)} · {ratingCount} review{ratingCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-input bg-slate-50 px-3 py-2.5 text-center">
              <s.icon size={14} className="mx-auto text-accent" aria-hidden />
              <p className="mt-1 font-display text-base font-bold text-slate-900">
                {s.value}
              </p>
              <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/builders/${builder.slug}`}
            className="inline-flex items-center gap-1 rounded-pill bg-ink-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            View builder profile
            <ChevronRight size={14} aria-hidden />
          </Link>
          <Link
            href={`/search?builder=${encodeURIComponent(builder.slug)}`}
            className="inline-flex items-center gap-1 rounded-pill border border-accent/30 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
          >
            View all their projects
            <ChevronRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
