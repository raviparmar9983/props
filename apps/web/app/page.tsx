import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  FileText,
  Lock,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { searchProjects, getCities, getPublicStats, getBuilders, getBuilderBySlug } from "../lib/api";
import { ProjectCard } from "../components/project-card";
import { CategoryTiles } from "../components/category-tiles";
import { BrowseCities } from "../components/browse-cities";
import { HowItWorks } from "../components/how-it-works";
import { BuilderCta } from "../components/builder-cta";
import { BuilderStrip } from "../components/builder-strip";
import { HeroSearchCard } from "../components/hero-search-card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "PropertiesWale — Buy Homes from Verified Builders | Flats, Houses, Plots",
  description:
    "Browse flats, houses, plots and commercial spaces from verified builders. Transparent pricing, direct contact, no brokers. Find your dream home from 100% verified builders across India.",
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
    builders = details.slice(0, 4);
  } catch {
    builders = [];
  }

  const all = projects.data;
  const featured = all.filter((p) => p.isFeatured);
  const featuredList = featured.length ? featured.slice(0, 4) : all.slice(0, 4);

  const cityTiles =
    stats.citiesWithCounts.length > 0
      ? stats.citiesWithCounts
      : cities.map((c) => ({ slug: c.slug, name: c.name, count: 0 }));

  const builderCount = stats.verifiedBuilders;

  return (
    <div className="min-h-screen bg-paper pb-20 md:pb-0">
      {/* Hero Section — split layout matching design */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-8 md:pt-14 md:pb-12">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Headline + Search */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                FIND A BETTER TOMORROW
              </p>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink-blue md:text-[2.75rem] md:leading-[1.15]">
                Verified Properties.
                <br />
                Smarter Decisions.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                Flats, houses and plots from verified builders — no brokers, no confusion.
              </p>

              {/* Search Card */}
              <div className="mt-8">
                <HeroSearchCard cities={cities} showQuickFilters />
              </div>
            </div>

            {/* Right: Lifestyle image + floating cards */}
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl shadow-card-hover">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80"
                  alt="Luxury balcony overlooking city skyline"
                  className="h-[420px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-blue/30 to-transparent" />
              </div>

              {/* Verified Builders floating card */}
              <div className="absolute -left-6 top-8 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                <p className="text-lg font-bold text-ink-blue">{builderCount || "—"}{builderCount > 0 ? "+" : ""}</p>
                <p className="text-[10px] font-medium text-slate-500">Verified Builders</p>
                <div className="mt-2 flex -space-x-2">
                  {builders.slice(0, 3).map((b) => (
                    <span
                      key={b.slug}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-blue text-[8px] font-bold text-white ring-2 ring-white"
                      title={b.companyName}
                    >
                      {b.companyName.slice(0, 2).toUpperCase()}
                    </span>
                  ))}
                  {builderCount > 3 && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700 ring-2 ring-white">
                      +{builderCount - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Testimonial floating card */}
              <div className="absolute -right-4 bottom-8 max-w-[220px] rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                <div className="flex -space-x--2 gap-0">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-[9px] font-bold text-accent-dark ring-2 ring-white"
                      >
                        {String.fromCharCode(64 + i)}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600 italic">
                  &ldquo;Found our dream home in 2 weeks — zero broker hassle.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges Row */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "100% Verified Builders", sub: "Only trusted developers" },
              { icon: Tag, title: "No Brokerage", sub: "Direct contact with builders" },
              { icon: FileText, title: "Transparent Pricing", sub: "No hidden charges" },
              { icon: Lock, title: "Direct Contact", sub: "Your data is safe with us" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Categories Grid */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <CategoryTiles />
      </section>

      {/* Featured Projects Section */}
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
              Featured Projects
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Handpicked properties from top builders
            </p>
          </div>
          <Link
            href="/search?sort=featured"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-dark"
          >
            View all properties <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredList.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* Explore by City Section */}
      <div id="cities">
        <BrowseCities cities={cityTiles} />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Meet Our Builders Section */}
      <div id="builders">
        <BuilderStrip builders={builders} />
      </div>

      {/* About Section anchor */}
      <section id="about" className="mx-auto max-w-7xl px-6 pt-16">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">About PropertiesWale</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink-blue md:text-3xl">
            India&apos;s trusted platform for verified real estate
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
            PropertiesWale connects homebuyers directly with verified builders — no brokers,
            no hidden fees. Browse flats, houses, plots and commercial spaces with transparent
            pricing, RERA-verified listings, and direct builder contact.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <BuilderCta />
    </div>
  );
}
