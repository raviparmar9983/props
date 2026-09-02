import {
  Bus,
  GraduationCap,
  Hospital,
  Plane,
  ShoppingBag,
  Stethoscope,
  TrainFront,
  MapPin,
} from "lucide-react";
import type { NearbyLandmark } from "../types/public";

interface NearbyLandmarksProps {
  items: NearbyLandmark[];
}

const CATEGORY_META: Record<string, { label: string; icon: typeof MapPin }> = {
  SCHOOL: { label: "Schools", icon: GraduationCap },
  HOSPITAL: { label: "Hospitals", icon: Stethoscope },
  METRO: { label: "Metro", icon: TrainFront },
  RAILWAY: { label: "Railway", icon: TrainFront },
  AIRPORT: { label: "Airport", icon: Plane },
  HIGHWAY: { label: "Highways", icon: Bus },
  MALL: { label: "Malls & retail", icon: ShoppingBag },
  OTHER: { label: "Nearby", icon: MapPin },
};

function categoryMeta(category: string): { label: string; icon: typeof MapPin } {
  return CATEGORY_META[category] ?? CATEGORY_META["OTHER"]!;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function NearbyLandmarks({ items }: NearbyLandmarksProps) {
  if (items.length === 0) return null;

  const grouped = new Map<string, NearbyLandmark[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-slate-900">
        What&apos;s nearby
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[...grouped.entries()].map(([category, landmarks]) => {
          const meta = categoryMeta(category);
          return (
            <div
              key={category}
              className="rounded-card border border-slate-200 bg-surface p-4 shadow-card"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-accent-soft text-accent">
                  <meta.icon size={14} aria-hidden />
                </span>
                <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
              </div>
              <ul className="mt-3 space-y-2">
                {landmarks.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-slate-600">{l.name}</span>
                    <span className="shrink-0 rounded-pill bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                      {formatDistance(l.distanceKm)}
                      {l.travelTimeMinutes
                        ? ` · ${l.travelTimeMinutes} min`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
