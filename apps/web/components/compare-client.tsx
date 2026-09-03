"use client";

import { useState } from "react";
import Link from "next/link";
import type { CompareProject } from "../types/public";
import { useCompareSelection } from "../lib/compareSelection";
import { formatPrice, formatStatusLabel, fileUrl } from "../lib/format";
import {
  MapPin,
  Check,
  X as XIcon,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CompareClientProps {
  projects: CompareProject[];
  notFound: string[];
  initialSlugs: string[];
}

const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  pricing: "Pricing",
  units: "Unit Types",
  amenities: "Amenities",
  legal: "Legal & Compliance",
  construction: "Construction Quality",
  society: "Society & Security",
  location: "Location",
  builder: "Builder",
};

function StatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-400">Not specified</span>;
  const label = value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="rounded-pill bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}

function Highlight({ children, isBest }: { children: React.ReactNode; isBest?: boolean | undefined }) {
  return (
    <span className={isBest ? "font-semibold text-success" : ""}>
      {children}
    </span>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check size={16} className="text-success" />
  ) : (
    <XIcon size={16} className="text-slate-300" />
  );
}

interface ProjectHeadProps {
  project: CompareProject;
  initialSlugs: string[];
}

function ProjectHead({ project: p, initialSlugs }: ProjectHeadProps) {
  const { remove } = useCompareSelection();
  return (
    <div className="flex items-start gap-3">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-image bg-slate-100">
        {p.primaryImageUrl ? (
          <img
            src={fileUrl(p.primaryImageUrl) ?? p.primaryImageUrl}
            alt={p.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/projects/${p.slug}`}
          className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-accent-dark"
        >
          {p.title}
        </Link>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">{p.locality}</span>
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">
          {formatPrice(p.startingPrice)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          remove(p.slug);
          const remaining = initialSlugs.filter((s) => s !== p.slug && s !== "");
          if (remaining.length >= 2) {
            window.location.href = `/compare?slugs=${remaining.join(",")}`;
          } else {
            window.location.href = "/search";
          }
        }}
        aria-label={`Remove ${p.title}`}
        className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}

export function CompareClient({ projects, notFound, initialSlugs }: CompareClientProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    pricing: true,
    units: true,
    amenities: false,
    legal: false,
    construction: false,
    society: false,
    location: false,
    builder: false,
  });

  const toggle = (section: string) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const count = projects.length;

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

  // Sections config
  type Row = { label: string; values: (React.ReactNode | null)[]; isBest?: boolean[] };
  type Section = { key: string; rows: Row[] };

  const amenityRows: Row[] = allAmenities.map((amenity) => ({
    label: amenity,
    values: projects.map((p) =>
      p.amenities.includes(amenity) ? <Check size={16} className="text-success" /> : <XIcon size={16} className="text-slate-300" />
    ),
  }));

  const sections: Section[] = [
    {
      key: "overview",
      rows: [
        { label: "Property type", values: projects.map((p) => p.propertyTypes.join(", ")) },
        { label: "Location", values: projects.map((p) => `${p.locality}, ${p.city}`) },
        { label: "Status", values: projects.map((p) => <StatusBadge value={formatStatusLabel(p.possessionStatus)} />) },
      ],
    },
    {
      key: "pricing",
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
      rows: [
        {
          label: "Available units",
          values: projects.map((p) =>
            p.unitTypesSummary.length > 0 ? (
              <div className="flex flex-col gap-1">
                {p.unitTypesSummary.map((u, i) => (
                  <span key={i} className="text-xs">
                    {u.label} — {formatPrice(u.price)} ({u.availableCount} avail.)
                  </span>
                ))}
              </div>
            ) : (
              "—"
            )
          ),
        },
      ],
    },
    { key: "amenities", rows: amenityRows },
    {
      key: "legal",
      rows: [
        { label: "RERA status", values: projects.map((p) => <StatusBadge value={p.reraStatus} />) },
        { label: "Occupancy cert.", values: projects.map((p) => <StatusBadge value={p.occupancyCertStatus} />) },
        { label: "Commencement cert.", values: projects.map((p) => <StatusBadge value={p.commencementCertStatus} />) },
        { label: "Land title", values: projects.map((p) => <StatusBadge value={p.landTitleType} />) },
      ],
    },
    {
      key: "construction",
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
      rows: [
        { label: "Company", values: projects.map((p) => p.builder.companyName) },
        {
          label: "Verified",
          values: projects.map((p) =>
            p.builder.verificationStatus === "VERIFIED" ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check size={14} /> Verified
              </span>
            ) : (
              "—"
            )
          ),
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
    <div className="pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-slate-900 md:text-2xl">
                Compare Properties
              </h1>
              <p className="text-xs text-slate-500 md:text-sm">
                {count} {count === 1 ? "property" : "properties"} selected
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 md:px-4"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add more</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Not found notice */}
      {notFound.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            One property in this comparison is no longer available and was removed.
          </div>
        </div>
      )}

      {/* ── Mobile / tablet: stacked project cards (<md) ── */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 md:hidden">
        {projects.map((project, pi) => (
          <article
            key={project.slug}
            className="overflow-hidden rounded-card border border-slate-200 bg-surface shadow-sm"
          >
            <div className="border-b border-slate-100 bg-white p-4">
              <ProjectHead project={project} initialSlugs={initialSlugs} />
            </div>

            {sections.map((section) => {
              const expanded = expandedSections[section.key] !== false;
              return (
                <div key={section.key} className="border-t border-slate-100 first:border-t-0">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggle(section.key)}
                    className="flex w-full select-none items-center justify-between gap-2 bg-slate-50/80 px-4 py-3 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {SECTION_LABELS[section.key] ?? section.key}
                    </span>
                    {expanded ? (
                      <ChevronUp size={16} className="shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="shrink-0 text-slate-400" />
                    )}
                  </button>
                  {expanded && (
                    <dl>
                      {section.rows.map((row, ri) => (
                        <div
                          key={ri}
                          className="flex flex-col gap-0.5 border-t border-slate-100 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-4"
                        >
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:w-[38%] sm:shrink-0 sm:text-sm sm:normal-case sm:tracking-normal">
                            {row.label}
                          </dt>
                          <dd className="min-w-0 flex-1 break-words text-sm text-slate-700">
                            <Highlight isBest={row.isBest?.[pi]}>{row.values[pi] ?? "—"}</Highlight>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              );
            })}
          </article>
        ))}
      </div>

      {/* ── Desktop: side-by-side comparison table (≥md) ── */}

      {/* Sticky column headers — top aligns below the sticky page header */}
      <div className="sticky top-0 z-20 hidden border-b border-slate-200 bg-surface/95 backdrop-blur-sm md:top-[73px] md:block">
        <div className="mx-auto max-w-6xl px-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="w-[120px] py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:w-[200px]">
                    Attribute
                  </th>
                  {projects.map((p) => (
                    <th key={p.slug} className="min-w-[200px] py-3 text-left">
                      <ProjectHead project={p} initialSlugs={initialSlugs} />
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto hidden max-w-6xl px-4 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <tbody>
              {sections.map((section) => {
                const expanded = expandedSections[section.key] !== false;
                return (
                  <CompareSection
                    key={section.key}
                    label={SECTION_LABELS[section.key] ?? section.key}
                    rows={section.rows}
                    colCount={count}
                    expanded={expanded}
                    onToggle={() => toggle(section.key)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareSection({
  label,
  rows,
  colCount,
  expanded,
  onToggle,
}: {
  label: string;
  rows: Array<{ label: string; values: (React.ReactNode | null)[]; isBest?: boolean[] }>;
  colCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-t border-slate-200">
        <td
          colSpan={colCount + 1}
          className="cursor-pointer select-none bg-slate-50/80 py-3 px-4"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {label}
            </span>
            {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </td>
      </tr>
      {expanded &&
        rows.map((row, ri) => (
          <tr key={ri} className="border-t border-slate-100">
            <td className="py-3 pl-4 pr-2 text-sm font-medium text-slate-500 md:pr-4">
              {row.label}
            </td>
            {row.values.map((val, ci) => (
              <td key={ci} className="py-3 pl-4 pr-2 text-sm text-slate-700 md:pr-4">
                <Highlight isBest={row.isBest?.[ci]}>{val ?? "—"}</Highlight>
              </td>
            ))}
          </tr>
        ))}
    </>
  );
}
