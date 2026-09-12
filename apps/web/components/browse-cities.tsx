import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CityTile {
  slug: string;
  name: string;
  count: number;
}

const CITY_IMAGES: Record<string, string> = {
  mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
  pune: "https://images.unsplash.com/photo-1595658658421-a9ac457190ae?auto=format&fit=crop&w=600&q=80",
  bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80",
  hyderabad: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=80",
  chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
  kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80",
};

export function BrowseCities({ cities }: { cities: CityTile[] }) {
  const displayCities = cities.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
            Explore by City
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Discover verified properties across India
          </p>
        </div>
        <Link
          href="/cities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark"
        >
          View all cities <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      {displayCities.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
          Cities will appear here when published projects are available.
        </div>
      ) : (
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {displayCities.map((city) => {
          const img = CITY_IMAGES[city.slug] ?? CITY_IMAGES.mumbai;
          const count = city.count;

          return (
            <Link
              key={city.slug}
              href={`/search?city=${encodeURIComponent(city.slug)}`}
              className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-xl p-4 text-white shadow-sm transition-transform hover:-translate-y-1"
            >
              {/* Background image & gradient */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${img}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p className="font-bold text-base text-white">{city.name}</p>
                  <p className="text-[11px] text-white/80">{count} properties</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-transform group-hover:translate-x-0.5">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </section>
  );
}
