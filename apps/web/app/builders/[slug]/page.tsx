import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  Briefcase,
  Building2,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getBuilderBySlug } from "../../../lib/api";
import { VerifiedBadge } from "../../../components/verified-badge";
import { fileUrl } from "../../../lib/format";
import type { PublicBuilderDetail } from "../../../types/public";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const builder = await getBuilderBySlug(slug);
    const title = `${builder.companyName} — Verified Builder in ${builder.city} | VerifiedProps`;
    const description = `${builder.companyName} is a ${
      builder.yearsInBusiness ?? "trusted"
    } year old verified builder in ${builder.city} with ${
      builder.totalProjectsCompleted ?? 0
    } completed projects and ${builder.stats.reviewCount} customer reviews. Explore their portfolio on VerifiedProps.`;
    const keywords = [
      builder.companyName,
      `${builder.companyName} projects`,
      `builder in ${builder.city}`,
      `verified builder ${builder.city}`,
      `${builder.city} real estate builder`,
      "RERA registered builder",
      `${builder.companyName} reviews`,
      "top builders in India",
      builder.city ? `best builders in ${builder.city}` : "",
    ].filter(Boolean);

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `/builders/${builder.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `/builders/${builder.slug}`,
        siteName: "VerifiedProps",
        images: builder.logo
          ? [{ url: fileUrl(builder.logo) ?? builder.logo, width: 200, height: 200, alt: builder.companyName }]
          : [],
        locale: "en_IN",
        type: "profile",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "Builder Not Found — VerifiedProps",
      robots: { index: false, follow: false },
    };
  }
}

function formatRating(rating: number | null): string {
  if (rating === null) return "—";
  return rating % 1 === 0 ? rating.toFixed(1) : rating.toFixed(1);
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Award;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-card border border-slate-200 bg-surface p-4 text-center shadow-card">
      <Icon size={16} className="mx-auto text-accent" aria-hidden />
      <p className="mt-1.5 font-display text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
    </div>
  );
}

export default async function BuilderPage({ params }: PageProps) {
  const { slug } = await params;

  let builder: PublicBuilderDetail;
  try {
    builder = await getBuilderBySlug(slug);
  } catch {
    notFound();
  }

  const verified = builder.verificationStatus === "VERIFIED";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Search",
        item: `${baseUrl}/search`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: builder.companyName,
        item: `${baseUrl}/builders/${builder.slug}`,
      },
    ],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: builder.companyName,
    url: `${baseUrl}/builders/${builder.slug}`,
    logo: builder.logo ? fileUrl(builder.logo) ?? undefined : undefined,
    description: `${builder.companyName} is a verified builder in ${builder.city} with ${builder.totalProjectsCompleted ?? 0} completed projects.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: builder.city,
      addressCountry: "IN",
    },
    ...(builder.stats.averageRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: builder.stats.averageRating.toString(),
            reviewCount: builder.stats.reviewCount.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <div className="pb-24 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-400"
        >
          <Link href="/" className="transition-colors hover:text-accent">
            Home
          </Link>
          <ChevronRight size={12} aria-hidden />
          <Link
            href="/search"
            className="transition-colors hover:text-accent"
          >
            Search
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="truncate text-slate-600">{builder.companyName}</span>
        </nav>

        {/* Hero */}
        <section className="rounded-card border border-slate-200 bg-surface p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {builder.logo ? (
              <img
                src={fileUrl(builder.logo) ?? ""}
                alt={builder.companyName}
                className="h-16 w-16 rounded-full bg-surface object-contain"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-blue font-display text-2xl font-bold text-white">
                {builder.companyName.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {builder.companyName}
                </h1>
                {verified && <VerifiedBadge showLabel size={14} />}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                {builder.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} aria-hidden />
                    {builder.city}
                  </span>
                )}
                {builder.reraNumber && (
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={13} className="text-success" aria-hidden />
                    RERA: {builder.reraNumber}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/search?builder=${encodeURIComponent(builder.slug)}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-ink-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              View their projects
              <ChevronRight size={14} aria-hidden />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              icon={Building2}
              value={String(builder.stats.projectsCount)}
              label="Active projects"
            />
            <StatCard
              icon={Star}
              value={formatRating(builder.stats.averageRating)}
              label={`${builder.stats.reviewCount} review${
                builder.stats.reviewCount !== 1 ? "s" : ""
              }`}
            />
            <StatCard
              icon={Briefcase}
              value={builder.yearsInBusiness ? `${builder.yearsInBusiness}y` : "—"}
              label="In business"
            />
            <StatCard
              icon={Building2}
              value={
                builder.totalProjectsCompleted !== null
                  ? String(builder.totalProjectsCompleted)
                  : "—"
              }
              label="Completed"
            />
            <StatCard
              icon={Award}
              value={
                builder.onTimeDeliveryRate !== null
                  ? `${builder.onTimeDeliveryRate}%`
                  : "—"
              }
              label="On-time delivery"
            />
          </div>
        </section>

        {/* Portfolio */}
        {builder.portfolio.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
              Completed projects
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {builder.portfolio.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card"
                >
                  {p.coverImageUrl ? (
                    <img
                      src={fileUrl(p.coverImageUrl) ?? ""}
                      alt={p.title}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-slate-100">
                      <Building2 size={28} className="text-slate-300" aria-hidden />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-slate-900">
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {p.city}
                      {p.completionYear ? ` · Completed ${p.completionYear}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {p.unitsCount !== null && (
                        <span className="rounded-pill bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
                          {p.unitsCount} units
                        </span>
                      )}
                      {p.deliveredOnTime !== null && (
                        <span
                          className={`rounded-pill px-2.5 py-1 font-medium ${
                            p.deliveredOnTime
                              ? "bg-success-soft text-success"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {p.deliveredOnTime
                            ? "Delivered on time"
                            : "Delivered late"}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {p.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
              Customer reviews
            </h2>
            {builder.stats.averageRating !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-rating-gold/15 px-3 py-1.5 text-sm font-semibold text-[#9A6B12]">
                <Star size={14} className="fill-rating-gold text-rating-gold" aria-hidden />
                {formatRating(builder.stats.averageRating)} / 5
              </span>
            )}
          </div>
          {builder.reviews.length === 0 ? (
            <p className="mt-3 rounded-card border border-slate-200 bg-surface p-5 text-sm text-slate-400 shadow-card">
              No reviews yet — be the first to share your experience.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {builder.reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-card border border-slate-200 bg-surface p-5 shadow-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {r.reviewerName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatReviewDate(r.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i <= r.rating
                              ? "fill-rating-gold text-rating-gold"
                              : "text-slate-200"
                          }
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                      {r.comment}
                    </p>
                  )}
                  {r.isVerifiedPurchase && (
                    <span className="mt-2.5 inline-flex items-center gap-1 rounded-pill bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                      <ShieldCheck size={11} aria-hidden />
                      Verified purchase
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
