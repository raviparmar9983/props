import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { getProjectBySlug, searchProjects } from "../../../lib/api";
import { ProjectMedia } from "../../../components/project-media";
import { VerifiedBadge } from "../../../components/verified-badge";
import { AmenityIcon } from "../../../components/amenity-icon";
import { UnitTypeCards } from "../../../components/unit-type-cards";
import { ProjectCard } from "../../../components/project-card";
import { ExpressInterest } from "../../../features/leads/express-interest";
import { ReadMore } from "../../../components/read-more";
import { FloorPlans } from "../../../components/floor-plans";
// Google Maps embed temporarily disabled
// import { ProjectMap } from "../../../components/project-map";
import { ContactList } from "../../../components/contact-list";
import { TrustLegal } from "../../../components/trust-legal";
import { PriceAndEmi } from "../../../components/price-and-emi";
import { PaymentPlans } from "../../../components/payment-plans";
import { Specifications } from "../../../components/specifications";
import { NearbyLandmarks } from "../../../components/nearby-landmarks";
import { ConstructionUpdates } from "../../../components/construction-updates";
import { BuilderCard } from "../../../components/builder-card";
import { ProjectFaqs } from "../../../components/project-faqs";
import { CalendarDays, ChevronRight, Construction, House, IndianRupee, MapPin } from "lucide-react";
import { CompareToggle } from "../../../components/compare-toggle";
import { CompareDropdown } from "../../../components/compare-dropdown";
import {
  formatPrice,
  formatStatusLabel,
  formatPossessionDate,
  fileUrl,
} from "../../../lib/format";
import type { PublicProjectSummary } from "../../../types/public";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flats",
  HOUSE: "Houses",
  PLOT: "Plots",
  SHOP: "Shops",
  CORPORATE: "Corporate",
  TENEMENT: "Tenements",
};

function propertyTypeLabel(value: string): string {
  return PROPERTY_TYPE_LABELS[value] ?? value;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProjectBySlug(slug);
    const primaryImage = project.media.find((m) => m.isPrimary)?.url;
    const resolvedImage = primaryImage
      ? (fileUrl(primaryImage) ?? primaryImage)
      : null;
    const title = project.metaTitle ?? `${project.title} in ${project.locality.name}, ${project.city.name} | VerifiedProps`;
    const description =
      project.metaDescription ??
      `Buy ${project.title} in ${project.locality.name}, ${project.city.name}. ${project.description?.slice(0, 120) ?? "Explore verified builder project with transparent pricing."}`;

    const propertyLabels = [...new Set(project.unitTypes.map((u) => PROPERTY_TYPE_LABELS[u.propertyType] ?? u.propertyType))];
    const startingPrice = project.unitTypes.length
      ? Math.min(...project.unitTypes.map((u) => u.price))
      : null;
    const keywords = [
      project.title,
      `buy ${propertyLabels[0]?.toLowerCase() ?? "property"} in ${project.city.name}`,
      `${project.city.name} real estate`,
      `${project.locality.name} property`,
      `${project.builder.companyName} projects`,
      "verified builder project",
      "RERA approved project",
      startingPrice ? `property under ${formatPrice(startingPrice)}` : "",
      project.status === "READY_TO_MOVE" ? "ready to move" : "under construction",
      "new launch property",
      `${project.city.name} flats`,
      `${project.city.name} houses`,
      `${project.locality.name} apartments`,
    ].filter(Boolean);

    return {
      title,
      description,
      keywords,
      authors: [{ name: project.builder.companyName }],
      alternates: {
        canonical: `/projects/${project.slug}`,
      },
      openGraph: {
        title: project.metaTitle ?? `${project.title} — ${project.city.name}`,
        description,
        url: `/projects/${project.slug}`,
        siteName: "VerifiedProps",
        images: project.ogImageUrl
          ? [{ url: project.ogImageUrl, width: 1200, height: 630, alt: project.title }]
          : resolvedImage
            ? [{ url: resolvedImage, width: 1200, height: 630, alt: project.title }]
            : [],
        locale: "en_IN",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: project.metaTitle ?? project.title,
        description,
        images: project.ogImageUrl
          ? [project.ogImageUrl]
          : resolvedImage
            ? [resolvedImage]
            : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "Project Not Found — VerifiedProps",
      description: "The property you are looking for could not be found.",
      robots: { index: false, follow: false },
    };
  }
}

async function fetchSimilar(
  slug: string,
  citySlug: string,
  propertyType: string | null,
  startingPrice: number | null,
): Promise<PublicProjectSummary[]> {
  const exclude = (list: PublicProjectSummary[]) =>
    list.filter((p) => p.slug !== slug);

  const base = { city: citySlug, limit: 8 };

  if (startingPrice !== null && propertyType) {
    const byAll = await searchProjects({
      ...base,
      propertyType,
      minPrice: Math.round(startingPrice * 0.7),
      maxPrice: Math.round(startingPrice * 1.3),
    });
    const list = exclude(byAll.data);
    if (list.length >= 3) return list.slice(0, 8);
  }

  if (propertyType) {
    const byType = await searchProjects({ ...base, propertyType });
    const list = exclude(byType.data);
    if (list.length >= 3) return list.slice(0, 8);
  }

  const byCity = await searchProjects(base);
  const cityList = exclude(byCity.data);
  if (cityList.length >= 3) return cityList.slice(0, 8);

  const anyWhere = await searchProjects({ limit: 8 });
  const anyList = exclude(anyWhere.data);
  if (anyList.length >= 3) return anyList.slice(0, 8);

  return [];
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  let project;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    notFound();
  }

  const unitTypes = project.unitTypes;
  const startingPrice = unitTypes.length
    ? Math.min(...unitTypes.map((u) => u.price))
    : null;
  const availableCount = unitTypes.reduce(
    (sum, u) => sum + (u.availableCount > 0 ? u.availableCount : 0),
    0,
  );
  const propertyTypeLabels = [
    ...new Set(unitTypes.map((u) => propertyTypeLabel(u.propertyType))),
  ];
  const dominantTypeValue =
    unitTypes.length > 0 ? unitTypes[0]!.propertyType : null;
  const statusLabel = formatStatusLabel(project.status);
  const possession = formatPossessionDate(project.possessionDate);
  const verified = project.builder.verificationStatus === "VERIFIED";

  // Derive a BHK range (e.g. "2–3 BHK") from unit labels for the header line.
  const bhkMatches = unitTypes
    .map((u) => /(\d+)\s*BHK/i.exec(u.label)?.[1])
    .filter((v): v is string => Boolean(v))
    .map(Number);
  const distinctBhk = [...new Set(bhkMatches)].sort((a, b) => a - b);
  const configuration =
    distinctBhk.length === 1
      ? `${distinctBhk[0]} BHK`
      : distinctBhk.length > 1
        ? `${distinctBhk[0]}–${distinctBhk[distinctBhk.length - 1]!} BHK`
        : null;
  const headerMetaLine = [
    propertyTypeLabels.join(" · ") || null,
    configuration,
    possession ? `Possession ${possession}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const primaryImageUrl =
    project.media.find((m) => m.isPrimary)?.url ??
    project.media.find((m) => m.type === "IMAGE")?.url ??
    null;
  const resolvedPrimary = primaryImageUrl
    ? (fileUrl(primaryImageUrl) ?? primaryImageUrl)
    : null;

  const quickFacts: { label: string; value: string; icon: ReactElement }[] = [
    {
      label: "Type",
      value: propertyTypeLabels.join(" · ") || "—",
      icon: <House size={16} aria-hidden />,
    },
    {
      label: "Status",
      value: statusLabel || "—",
      icon: <Construction size={16} aria-hidden />,
    },
    possession && {
      label: "Possession",
      value: possession,
      icon: <CalendarDays size={16} aria-hidden />,
    },
    startingPrice !== null && {
      label: "Starts at",
      value: formatPrice(startingPrice),
      icon: <IndianRupee size={16} aria-hidden />,
    },
  ].filter((f): f is { label: string; value: string; icon: ReactElement } =>
    Boolean(f),
  );

  let similar: PublicProjectSummary[] = [];
  try {
    similar = await fetchSimilar(
      project.slug,
      project.city.slug,
      dominantTypeValue,
      startingPrice,
    );
  } catch {
    similar = [];
  }

  // Sort: featured first, then newest.
  similar = [...similar].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  );

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
        name: project.city.name,
        item: `${baseUrl}/search?city=${encodeURIComponent(project.city.slug)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: project.title,
        item: `${baseUrl}/projects/${project.slug}`,
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: project.title,
    description: project.description ?? `${project.title} in ${project.locality.name}, ${project.city.name} by ${project.builder.companyName}`,
    image: resolvedPrimary ? [resolvedPrimary] : [],
    brand: {
      "@type": "Brand",
      name: project.builder.companyName,
    },
    category: propertyTypeLabels.join(", ") || "Real Estate",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: startingPrice?.toString() ?? undefined,
      highPrice: unitTypes.length > 0 ? Math.max(...unitTypes.map((u) => u.price)).toString() : undefined,
      offerCount: unitTypes.length.toString(),
      availability:
        availableCount > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${baseUrl}/projects/${project.slug}`,
      seller: {
        "@type": "Organization",
        name: "VerifiedProps",
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Status",
        value: statusLabel,
      },
      {
        "@type": "PropertyValue",
        name: "Location",
        value: `${project.locality.name}, ${project.city.name}`,
      },
      project.latitude && project.longitude
        ? {
            "@type": "PropertyValue",
            name: "GeoCoordinates",
            value: `${project.latitude}, ${project.longitude}`,
          }
        : null,
    ].filter(Boolean),
  };

  const faqJsonLd =
    project.faqs && project.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: project.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: project.builder.companyName,
    url: `${baseUrl}/builders/${project.builder.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: project.city.name,
      addressCountry: "IN",
    },
    ...(project.latitude && project.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: project.latitude,
            longitude: project.longitude,
          },
        }
      : {}),
  };

  const shareUrl = `/projects/${project.slug}`;

  return (
    <div className="pb-24 md:pb-0">
      {/* Hero gallery (full-bleed mobile, contained desktop) */}
      <div className="md:mx-auto md:max-w-6xl md:px-4 md:pt-6">
        <ProjectMedia
          media={project.media}
          alt={project.title}
          projectId={project.id}
          shareTitle={project.title}
          shareUrl={shareUrl}
        />
      </div>

      {/* A13 — JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        {/* Floating property header — overlaps the gallery bottom on desktop */}
        <section className="mt-4 rounded-card-xl border border-slate-200/80 bg-surface p-5 shadow-card md:-mt-12 md:p-6">
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
            <span className="truncate text-slate-600">{project.title}</span>
          </nav>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-[26px] font-bold leading-tight text-slate-900 md:text-[32px]">
                {project.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 md:text-[15px]">
                <MapPin size={15} className="shrink-0 text-accent" aria-hidden />
                {project.locality.name}, {project.city.name}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {verified && <VerifiedBadge showLabel size={14} />}
                {statusLabel && (
                  <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-dark">
                    {statusLabel}
                  </span>
                )}
              </div>
              {headerMetaLine && (
                <p className="mt-2.5 text-sm font-medium text-slate-600">
                  {headerMetaLine}
                </p>
              )}
            </div>
            <div className="relative flex shrink-0 items-center gap-2">
              <CompareDropdown currentSlug={project.slug} />
              <CompareToggle slug={project.slug} />
            </div>
          </div>
        </section>

        {/* Quick facts tiles */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickFacts.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft/70 text-accent-dark">
                {f.icon}
              </span>
              <p className="mt-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                {f.label}
              </p>
              <p
                className="mt-1 truncate text-sm font-semibold text-slate-900 md:text-[15px]"
                title={f.value}
              >
                {f.value}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-8 flex flex-col gap-8 pb-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* B1 — Trust & legal strip */}
            <TrustLegal project={project} />

            {/* A5 — Description */}
            {project.description && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-slate-900 md:text-[22px]">
                  About this project
                </h2>
                <ReadMore text={project.description} className="mt-3" />
              </section>
            )}

            {/* A6 — Unit types & pricing */}
            {unitTypes.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-slate-900 md:text-[22px]">
                    Unit types & pricing
                  </h2>
                  <span className="rounded-pill bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                    {availableCount > 0
                      ? `${availableCount} available`
                      : "Booked out"}
                  </span>
                </div>
                <div className="mt-4">
                  <UnitTypeCards
                    projectId={project.id}
                    builderName={project.builder.companyName}
                    unitTypes={unitTypes}
                  />
                </div>
              </section>
            )}

            {/* B2 — Price breakdown + EMI calculator */}
            {startingPrice !== null && (
              <PriceAndEmi
                priceComponents={project.priceComponents ?? []}
                startingPrice={startingPrice}
              />
            )}

            {/* B3 — Payment plans & home loan partners */}
            <PaymentPlans
              plans={project.paymentPlans ?? []}
              bankPartners={project.bankPartners ?? []}
            />

            {/* A7 — Amenities icon grid */}
            {project.amenities.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-slate-900 md:text-[22px]">
                  Amenities
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {project.amenities.map((a) => (
                    <div
                      key={a.amenity.id}
                      className="flex items-center gap-2.5 rounded-card border border-slate-200 bg-surface px-3 py-3 shadow-card"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-accent">
                        <AmenityIcon icon={a.amenity.icon} size={16} />
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {a.amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* B4 — Specifications accordion */}
            <Specifications items={project.specifications ?? []} />

            {/* A8 — Floor plans & brochures */}
            <FloorPlans media={project.media} />

            {/* A9 — Location */}
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-slate-900 md:text-[22px]">
                Location
              </h2>
              <div className="mt-3 rounded-card border border-slate-200 bg-surface p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-accent">
                    <MapPin size={16} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {project.address ?? `${project.locality.name}, ${project.city.name}`}
                    </p>
                    {project.latitude && project.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 rounded-pill border border-accent/30 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
                      >
                        Open in Google Maps
                        <ChevronRight size={14} aria-hidden />
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        Map location coming soon
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Google Maps embed — temporarily disabled
              {project.latitude && project.longitude && (
                <ProjectMap
                  latitude={project.latitude}
                  longitude={project.longitude}
                  title={project.title}
                />
              )}
              */}

              {/* B5 — Nearby landmarks grouped under the map */}
              <NearbyLandmarks items={project.landmarks ?? []} />
            </section>

            {/* B6 — Construction updates */}
            <ConstructionUpdates items={project.constructionUpdates ?? []} />

            {/* A10 — Builder info */}
            <BuilderCard builder={project.builder} />

            {/* A11 — Contacts (auth-gated, visually secondary) */}
            <ContactList slug={project.slug} />
          </div>

          {/* A4 — Sticky CTA */}
          <ExpressInterest
            projectId={project.id}
            builderName={project.builder.companyName}
            startingPriceLabel={
              startingPrice !== null ? formatPrice(startingPrice) : "On request"
            }
            availableCount={availableCount}
            unitTypes={unitTypes.map((ut) => ({
              id: ut.id,
              label: ut.label,
              price: ut.price,
            }))}
            propertyTypeLabel={
              propertyTypeLabels.join(" · ") || null
            }
            configuration={configuration}
            possessionLabel={possession || null}
          />
        </div>

        {/* B8 — FAQs before similar properties */}
        <ProjectFaqs items={project.faqs ?? []} />

        {/* A12 — Similar properties */}
        {similar.length > 0 && (
          <section className="border-t border-slate-200 py-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
                You may also like
              </h2>
              <Link
                href={`/search?city=${encodeURIComponent(project.city.slug)}`}
                className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
              >
                View more
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
