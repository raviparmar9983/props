import type { Metadata } from "next";
import { CitiesDirectory } from "../../components/cities-directory";
import { getCities, getPublicStats } from "../../lib/api";

export const metadata: Metadata = {
  title: "Explore Properties by City | PropertiesWale",
  description: "Discover published projects from verified builders in cities across India.",
};

export const revalidate = 300;

export default async function CitiesPage() {
  let cities: Awaited<ReturnType<typeof getCities>> = [];
  let cityCounts: Awaited<ReturnType<typeof getPublicStats>>["citiesWithCounts"] = [];

  try {
    [cities, cityCounts] = await Promise.all([
      getCities(),
      getPublicStats().then((stats) => stats.citiesWithCounts),
    ]);
  } catch {
    cities = [];
    cityCounts = [];
  }

  const countBySlug = new Map(cityCounts.map((city) => [city.slug, city.count]));
  const directoryCities = cities.map((city) => ({
    slug: city.slug,
    name: city.name,
    count: countBySlug.get(city.slug) ?? 0,
  }));

  return (
    <main className="min-h-screen bg-paper pb-24 md:pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Explore by location</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink-blue md:text-5xl">Find a better home, city by city</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Start with a city, then narrow published projects by locality, type, budget and possession status.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="mb-5 text-sm font-semibold text-slate-600">{directoryCities.length} available {directoryCities.length === 1 ? "city" : "cities"}</p>
        <CitiesDirectory cities={directoryCities} />
      </section>
    </main>
  );
}
