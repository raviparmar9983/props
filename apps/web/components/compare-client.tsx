"use client";

import Link from "next/link";
import type { CompareProject } from "../types/public";
import { useCompareSelection } from "../lib/compareSelection";
import { formatPrice, formatStatusLabel, fileUrl } from "../lib/format";
import { StatusBadge, BoolIcon } from "./status-badge";
import {
  MapPin,
  X as XIcon,
  Plus,
  ChevronDown,
  Award,
  Info,
  IndianRupee,
  Home,
  Sparkles,
  ShieldCheck,
  HardHat,
  Lock,
  type LucideIcon,
} from "lucide-react";

interface CompareClientProps {
  projects: CompareProject[];
  notFound: string[];
  initialSlugs: string[];
}

type Row = { label: string; values: (React.ReactNode | null)[]; isBest?: boolean[] };
type Section = { key: string; label: string; icon: LucideIcon; defaultOpen: boolean; rows: Row[] };

function Highlight({ children, isBest }: { children: React.ReactNode; isBest?: boolean | undefined }) {
  return <>{isBest ? <span className="font-bold text-accent-dark">{children}</span> : children}</>;
}

/** One property's summary card in the header strip, with its own remove action. */
function ComparePropertyCard({
  project,
  onRemove,
}: {
  project: CompareProject;
  onRemove: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-card">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${project.title} from comparison`}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500"
      >
        <XIcon size={14} />
      </button>
      <Link href={`/projects/${project.slug}`} className="block h-36 w-full bg-slate-100">
        {project.primaryImageUrl ? (
          <img
            src={fileUrl(project.primaryImageUrl) ?? project.primaryImageUrl}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link
          href={`/projects/${project.slug}`}
          className="line-clamp-1 block font-display text-base font-bold text-slate-900 hover:text-accent-dark"
        >
          {project.title}
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">
            {project.locality}, {project.city}
          </span>
        </p>
        <p className="mt-2 font-display text-lg font-bold text-slate-900">
          {formatPrice(project.startingPrice)}
        </p>
      </div>
    </div>
  );
}

/** One attribute row: a sticky label cell + one value cell per property. */
function RowCells({ row }: { row: Row }) {
  return (
    <>
      <div className="sticky left-0 z-10 border-b border-slate-100 bg-surface px-4 py-3 text-xs font-medium leading-5 text-slate-500">
        {row.label}
      </div>
      {row.values.map((val, ci) => {
        const best = row.isBest?.[ci];
        return (
          <div
            key={ci}
            className={`border-b border-l border-slate-100 px-4 py-3 text-sm leading-5 ${
              best ? "bg-accent-soft/50" : ""
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {best && <Award size={13} className="shrink-0 text-accent" aria-hidden />}
              <Highlight isBest={best}>{val ?? "—"}</Highlight>
            </span>
          </div>
        );
      })}
    </>
  );
}

/** One category (Pricing, Amenities, ...) as a collapsible card with an
 * internally scrollable comparison grid — the same markup serves mobile
 * (swipe sideways within the card) and desktop (columns fit without
 * scrolling), instead of maintaining two separate render paths. */
function CategoryCard({ section, count }: { section: Section; count: number }) {
  return (
    <details
      open={section.defaultOpen}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-card"
    >
      <summary className="flex cursor-pointer list-none select-none items-center gap-2 bg-slate-50/80 px-4 py-3 marker:content-none">
        <section.icon size={16} className="shrink-0 text-accent" aria-hidden />
        <span className="text-sm font-bold text-slate-800">{section.label}</span>
        <ChevronDown
          size={16}
          className="ml-auto shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-max"
          style={{ gridTemplateColumns: `10rem repeat(${count}, minmax(11rem, 1fr))` }}
        >
          {section.rows.map((row, ri) => (
            <RowCells key={ri} row={row} />
          ))}
        </div>
      </div>
    </details>
  );
}

export function CompareClient({ projects, notFound, initialSlugs }: CompareClientProps) {
  const { remove } = useCompareSelection();
  const count = projects.length;

  function removeProject(slug: string) {
    remove(slug);
    const remaining = initialSlugs.filter((s) => s !== slug && s !== "");
    window.location.href = remaining.length >= 2 ? `/compare?slugs=${remaining.join(",")}` : "/search";
  }

  // Compute best values for numeric rows
  const prices = projects.map((p) => p.startingPrice);
  const minPrice = Math.min(...prices);
  const pricePerSqfts = projects.map((p) => p.pricePerSqft).filter((v): v is number => v !== null);
  const minPpsf = pricePerSqfts.length > 0 ? Math.min(...pricePerSqfts) : null;
  const deliveryRates = projects.map((p) => p.builder.onTimeDeliveryRate).filter((v): v is number => v !== null);
  const maxDelivery = deliveryRates.length > 0 ? Math.max(...deliveryRates) : null;
  const ratings = projects.map((p) => p.builder.averageReviewRating).filter((v): v is number => v !== null);
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : null;

  // All unique amenities across projects
  const allAmenities = [...new Set(projects.flatMap((p) => p.amenities))].sort();
  const amenityRows: Row[] = allAmenities.map((amenity) => ({
    label: amenity,
    values: projects.map((p) =>
      p.amenities.includes(amenity) ? <BoolIcon value={true} /> : <BoolIcon value={false} />
    ),
  }));

  const sections: Section[] = [
    {
      key: "overview",
      label: "Overview",
      icon: Info,
      defaultOpen: true,
      rows: [
        { label: "Property type", values: projects.map((p) => p.propertyTypes.join(", ")) },
        { label: "Location", values: projects.map((p) => `${p.locality}, ${p.city}`) },
        { label: "Status", values: projects.map((p) => <StatusBadge value={formatStatusLabel(p.possessionStatus)} />) },
      ],
    },
    {
      key: "pricing",
      label: "Pricing",
      icon: IndianRupee,
      defaultOpen: true,
      rows: [
        {
          label: "Starting price",
          values: projects.map((p) => formatPrice(p.startingPrice)),
          isBest: projects.map((p) => p.startingPrice === minPrice),
        },
        {
          label: "Price / sqft",
          values: projects.map((p) => (p.pricePerSqft ? `₹${p.pricePerSqft.toLocaleString("en-IN")}` : "—")),
          isBest: projects.map((p) => p.pricePerSqft !== null && p.pricePerSqft === minPpsf),
        },
        { label: "Booking amount", values: projects.map((p) => (p.bookingAmount ? formatPrice(p.bookingAmount) : "—")) },
        {
          label: "Payment plan",
          values: projects.map((p) =>
            p.paymentPlanType ? p.paymentPlanType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "—"
          ),
        },
      ],
    },
    {
      key: "units",
      label: "Unit Types",
      icon: Home,
      defaultOpen: true,
      rows: [
        {
          label: "Available units",
          values: projects.map((p) =>
            p.unitTypesSummary.length > 0 ? (
              <div className="space-y-1.5">
                {p.unitTypesSummary.map((u, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 text-xs">{u.label}</span>
                    <span className="shrink-0 whitespace-nowrap text-xs">
                      {formatPrice(u.price)} <span className="text-slate-400">({u.availableCount} avail.)</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              "—"
            )
          ),
        },
      ],
    },
    { key: "amenities", label: "Amenities", icon: Sparkles, defaultOpen: false, rows: amenityRows },
    {
      key: "legal",
      label: "Legal & Compliance",
      icon: ShieldCheck,
      defaultOpen: false,
      rows: [
        { label: "RERA status", values: projects.map((p) => <StatusBadge value={p.reraStatus} />) },
        { label: "Occupancy cert.", values: projects.map((p) => <StatusBadge value={p.occupancyCertStatus} />) },
        { label: "Commencement cert.", values: projects.map((p) => <StatusBadge value={p.commencementCertStatus} />) },
        { label: "Land title", values: projects.map((p) => <StatusBadge value={p.landTitleType} />) },
      ],
    },
    {
      key: "construction",
      label: "Construction Quality",
      icon: HardHat,
      defaultOpen: false,
      rows: [
        { label: "Structure type", values: projects.map((p) => p.structureType ?? "—") },
        { label: "Power backup", values: projects.map((p) => p.powerBackupCapacity ?? "—") },
        { label: "Water source", values: projects.map((p) => p.waterSource ?? "—") },
        { label: "Lifts", values: projects.map((p) => (p.liftCount ? `${p.liftCount}${p.liftBrand ? ` (${p.liftBrand})` : ""}` : "—")) },
        { label: "Fire safety", values: projects.map((p) => <BoolIcon value={p.fireSafetyCompliant} />) },
      ],
    },
    {
      key: "society",
      label: "Society & Security",
      icon: Lock,
      defaultOpen: false,
      rows: [
        { label: "Open space", values: projects.map((p) => (p.openSpacePercent != null ? `${p.openSpacePercent}%` : "—")) },
        { label: "Green area", values: projects.map((p) => (p.greenAreaPercent != null ? `${p.greenAreaPercent}%` : "—")) },
        { label: "CCTV", values: projects.map((p) => <BoolIcon value={p.hasCctv} />) },
        { label: "Gated entry", values: projects.map((p) => <BoolIcon value={p.hasGatedEntry} />) },
        { label: "Pet policy", values: projects.map((p) => p.petPolicy ?? "—") },
      ],
    },
    {
      key: "location",
      label: "Location",
      icon: MapPin,
      defaultOpen: false,
      rows: (() => {
        const categories = [...new Set(projects.flatMap((p) => Object.keys(p.nearestLandmarks)))].sort();
        return categories.map((cat) => ({
          label: cat.charAt(0) + cat.slice(1).toLowerCase(),
          values: projects.map((p) => {
            const lm = p.nearestLandmarks[cat];
            return lm ? `${lm.name} (${lm.distanceKm} km)` : "—";
          }),
        }));
      })(),
    },
    {
      key: "builder",
      label: "Builder",
      icon: Award,
      defaultOpen: false,
      rows: [
        { label: "Company", values: projects.map((p) => p.builder.companyName) },
        {
          label: "Verified",
          values: projects.map((p) => <BoolIcon value={p.builder.verificationStatus === "VERIFIED"} />),
        },
        { label: "Years in business", values: projects.map((p) => (p.builder.yearsInBusiness != null ? `${p.builder.yearsInBusiness} yrs` : "—")) },
        { label: "Projects completed", values: projects.map((p) => (p.builder.totalProjectsCompleted != null ? String(p.builder.totalProjectsCompleted) : "—")) },
        {
          label: "On-time delivery",
          values: projects.map((p) => (p.builder.onTimeDeliveryRate != null ? `${p.builder.onTimeDeliveryRate}%` : "—")),
          isBest: projects.map((p) => p.builder.onTimeDeliveryRate != null && p.builder.onTimeDeliveryRate === maxDelivery),
        },
        {
          label: "Review rating",
          values: projects.map((p) =>
            p.builder.averageReviewRating != null
              ? `${p.builder.averageReviewRating.toFixed(1)} (${p.builder.reviewCount} reviews)`
              : "No reviews"
          ),
          isBest: projects.map((p) => p.builder.averageReviewRating != null && p.builder.averageReviewRating === maxRating),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 md:pb-10">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">Compare Properties</h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {count} {count === 1 ? "property" : "properties"} selected
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-xs font-bold text-white shadow-accent-button transition-colors hover:bg-accent-dark sm:text-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add more</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
        {/* Not found notice */}
        {notFound.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            One property in this comparison is no longer available and was removed.
          </div>
        )}

        {/* Property header strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ComparePropertyCard key={project.slug} project={project} onRemove={() => removeProject(project.slug)} />
          ))}
        </div>

        {/* Category comparison cards */}
        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <CategoryCard key={section.key} section={section} count={count} />
          ))}
        </div>
      </div>
    </div>
  );
}
