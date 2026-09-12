import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface CityDirectoryItem {
  slug: string;
  name: string;
  count: number;
}

const CITY_IMAGES: Record<string, string> = {
  mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
  pune: "https://images.unsplash.com/photo-1595658658421-a9ac457190ae?auto=format&fit=crop&w=900&q=80",
  bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80",
  hyderabad: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=900&q=80",
  chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80",
};

export function CitiesDirectory({ cities }: { cities: CityDirectoryItem[] }) {
  if (cities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-500">
        No city listings are available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => (
        <Link
          key={city.slug}
          href={`/search?city=${encodeURIComponent(city.slug)}`}
          className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-card-hover"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${CITY_IMAGES[city.slug] ?? CITY_IMAGES.mumbai}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-blue via-ink-blue/40 to-transparent" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
                <MapPin size={14} aria-hidden /> Explore properties
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">{city.name}</h2>
              <p className="mt-1 text-sm text-white/85">{city.count} {city.count === 1 ? "property" : "properties"}</p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink-blue transition group-hover:translate-x-1">
              <ArrowRight size={19} aria-hidden />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
