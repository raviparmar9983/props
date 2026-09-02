import Link from "next/link";
import { MapPin } from "lucide-react";

interface CityTile {
  slug: string;
  name: string;
  count: number;
}

const TILE_STYLES = [
  "from-ink-blue to-slate-800",
  "from-accent to-accent-dark",
  "from-slate-700 to-slate-900",
  "from-ink-blue to-accent-dark",
];

export function BrowseCities({ cities }: { cities: CityTile[] }) {
  if (cities.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h2 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
        Explore by city
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cities.map((city, i) => (
          <Link
            key={city.slug}
            href={`/search?city=${encodeURIComponent(city.slug)}`}
            className={`group flex flex-col justify-between rounded-card bg-gradient-to-br p-4 text-white shadow-card transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] ${
              TILE_STYLES[i % TILE_STYLES.length]
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-white/15">
              <MapPin size={16} aria-hidden />
            </span>
            <span className="mt-8">
              <span className="block font-display text-base font-semibold">
                {city.name}
              </span>
              <span className="block text-xs text-white/70">
                {city.count} propert{city.count === 1 ? "y" : "ies"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
