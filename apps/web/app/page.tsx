import Link from "next/link";
import type { Metadata } from "next";
import { Building2, CircleCheck, House, LandPlot, Store } from "lucide-react";
import { searchProjects, getCities, getPublicStats, getBuilders, getBuilderBySlug } from "../lib/api";
import { ProjectCard } from "../components/project-card";
import { CollapsingSearchBar } from "../components/collapsing-search-bar";
import { CategoryTiles } from "../components/category-tiles";
import { StatsBar } from "../components/stats-bar";
import { BrowseCities } from "../components/browse-cities";
import { HowItWorks } from "../components/how-it-works";
import { TrustSection } from "../components/trust-section";
import { BuilderCta } from "../components/builder-cta";
import { BuilderStrip } from "../components/builder-strip";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "VerifiedProps — Buy Homes from Verified Builders | Flats, Houses, Plots",
  description:
    "Browse flats, houses, plots and commercial spaces from verified builders. Transparent pricing, direct contact, no brokers. Find your dream home from 100% verified builders across India.",
  keywords: [
    "verified builders",
    "buy flat",
    "buy house",
    "buy plot",
    "property for sale",
    "real estate India",
    "residential projects",
    "new construction",
    "RERA verified",
    "apartments for sale",
    "housing projects",
    "no broker property",
    "builder direct",
    "ready to move",
    "under construction projects",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },
  openGraph: {
    title: "VerifiedProps — Buy Homes from Verified Builders",
    description:
      "Browse flats, houses, plots and commercial spaces from verified builders. Transparent pricing, direct contact, no brokers.",
    url: "/",
    siteName: "VerifiedProps",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "VerifiedProps — Verified Builders, Real Listings",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VerifiedProps — Buy Homes from Verified Builders",
    description:
      "Flats, houses and plots from verified builders. No brokers, transparent pricing.",
    images: ["/og-default.png"],
  },
};

export default async function HomePage() {
  let projects: Awaited<ReturnType<typeof searchProjects>>;
  let cities: Awaited<ReturnType<typeof getCities>>;
  let stats: Awaited<ReturnType<typeof getPublicStats>>;

  try {
    [projects, cities, stats] = await Promise.all([
      searchProjects({ limit: 18 }),
      getCities(),
      getPublicStats(),
    ]);
  } catch {
    projects = { data: [], meta: { page: 1, limit: 18, total: 0 }, appliedFilters: {} };
    cities = [];
    stats = { projects: 0, verifiedBuilders: 0, cities: 0, citiesWithCounts: [] };
  }

  // Builder showcase with track record (home placement).
  let builders: Awaited<ReturnType<typeof getBuilderBySlug>>[] = [];
  try {
    const builderList = await getBuilders();
    const details = (
      await Promise.allSettled(
        builderList.map((b) => getBuilderBySlug(b.slug)),
      )
    )
      .filter(
        (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getBuilderBySlug>>> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value);
    const withTrack = details.filter(
      (b) =>
        b.onTimeDeliveryRate !== null ||
        b.totalProjectsCompleted !== null ||
        b.yearsInBusiness !== null,
    );
    const ranked = [...withTrack, ...details].filter(
      (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i,
    );
    builders = ranked.slice(0, 6);
  } catch {
    builders = [];
  }

  const all = projects.data;
  const featured = all.filter((p) => p.isFeatured);
  const rest = all.filter((p) => !p.isFeatured);
  const featuredList = featured.length ? featured : all.slice(0, 6);
  const recent = rest.length ? rest : all;
  const location = cities[0]?.name ?? "";

  const cityTiles =
    stats.citiesWithCounts.length > 0
      ? stats.citiesWithCounts
      : cities.map((c) => ({ slug: c.slug, name: c.name, count: 0 }));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VerifiedProps",
    url: baseUrl,
    logo: `${baseUrl}/logo-full.svg`,
    description: metadata.description,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VerifiedProps",
    url: baseUrl,
    description: metadata.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="pb-24 md:pb-0">
      {/* B1 — Top search bar */}
      <CollapsingSearchBar cities={cities} location={location} />

      {/* B2 — Hero */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 pt-10 pb-14 text-center md:pt-16 md:pb-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-blueprint/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="animate-fade-rise inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/85 backdrop-blur">
            <CircleCheck size={13} strokeWidth={2.5} className="text-accent" aria-hidden />
            100% verified builders, zero brokerage
          </p>
          <h1 className="animate-fade-rise mt-4 font-display text-2xl font-bold leading-tight text-white md:text-4xl" style={{ animationDelay: "40ms" }}>
            Every property here is from a{" "}
            <span className="text-accent">verified builder</span>
          </h1>
          <p
            className="animate-fade-rise mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 md:text-base"
            style={{ animationDelay: "80ms" }}
          >
            Flats, houses and plots with transparent pricing — talk to the
            builder directly, with no brokers in between.
          </p>

          <div
            className="animate-fade-rise mt-6 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "120ms" }}
          >
            {[
              { value: "FLAT", label: "Flats", Icon: Building2 },
              { value: "HOUSE", label: "Houses", Icon: House },
              { value: "PLOT", label: "Plots", Icon: LandPlot },
              { value: "SHOP", label: "Shops", Icon: Store },
            ].map((t) => (
              <Link
                key={t.value}
                href={`/search?propertyType=${t.value}`}
                className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-accent hover:text-white active:scale-95"
              >
                <t.Icon size={14} aria-hidden />
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B3 — Category tiles */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <CategoryTiles />
      </section>

      {/* B4 — Trust / stats */}
      <StatsBar stats={stats} />

      {/* B5 — Featured projects */}
      {featuredList.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
              Featured projects
            </h2>
            <Link
              href="/search?featured=true"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              See all
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {featuredList.map((project, i) => (
              <div key={project.slug} className="w-[78vw] shrink-0 sm:w-80">
                <ProjectCard project={project} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* B6 — Browse by city */}
      {cityTiles.length > 0 && <BrowseCities cities={cityTiles} />}

      {/* B7 — How it works */}
      <HowItWorks />

      {/* B7b — Builder showcase with track record */}
      <BuilderStrip builders={builders} />

      {/* B8 — Recently added */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
            Recently added
          </h2>
          <Link
            href="/search"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-6 rounded-card bg-surface p-10 text-center shadow-card">
            <p className="text-slate-600">
              No projects available yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* B9 — Why verified */}
      <TrustSection />

      {/* B10 — Builder CTA */}
      <BuilderCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </div>
  );
}
