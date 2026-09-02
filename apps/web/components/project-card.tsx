"use client";

import Link from "next/link";
import type { PublicProjectSummary } from "../types/public";
import { ImageCarousel } from "./image-carousel";
import { CompareToggle } from "./compare-toggle";
import { SaveToggle } from "./save-toggle";
import { formatPrice, formatStatusLabel, fileUrl } from "../lib/format";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Home,
  LandPlot,
  MapPin,
  Store,
  type LucideIcon,
} from "lucide-react";

interface ProjectCardProps {
  project: PublicProjectSummary;
  index?: number;
}

const PROPERTY_TYPE_ICONS: Record<string, LucideIcon> = {
  FLAT: Building2,
  HOUSE: Home,
  PLOT: LandPlot,
  SHOP: Store,
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  HOUSE: "House",
  PLOT: "Plot",
  SHOP: "Shop",
};

function propertyTypeLabel(value: string): string {
  return (
    PROPERTY_TYPE_LABELS[value] ??
    value.charAt(0) + value.slice(1).toLowerCase()
  );
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const images = (project.media?.length ? project.media : [project.primaryImageUrl])
    .map(fileUrl)
    .filter((u): u is string => u !== null);

  const status = formatStatusLabel(project.status);
  const isReady = project.status === "READY" || project.status === "READY_TO_MOVE";
  const isNew =
    project.status === "UNDER_CONSTRUCTION" || project.status === "UPCOMING";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group animate-fade-rise block rounded-card-xl bg-surface p-1.5 shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      {/* Image */}
      <div className="relative">
        <ImageCarousel
          images={images}
          alt={project.title}
          aspectClassName="aspect-[4/3]"
          rounded={false}
          className="rounded-image-xl"
          showDots={images.length > 1}
          dotsPosition="top"
          showArrows
          slideClassName="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          overlay={() => (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
                {project.propertyTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.propertyTypes.slice(0, 2).map((pt) => {
                      const Icon = PROPERTY_TYPE_ICONS[pt] ?? Building2;
                      return (
                        <span
                          key={pt}
                          className="flex h-[22px] items-center gap-1 rounded-pill bg-white/20 px-2 text-[11px] font-medium text-white backdrop-blur-md"
                        >
                          <Icon size={11} strokeWidth={2.2} aria-hidden />
                          {propertyTypeLabel(pt)}
                        </span>
                      );
                    })}
                  </div>
                )}
                <h3 className="truncate font-display text-lg font-semibold leading-tight text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
                  {project.title}
                </h3>
                <p className="flex items-center gap-1 text-[13px] font-medium text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                  <MapPin size={12} strokeWidth={2.2} className="shrink-0" aria-hidden />
                  <span className="truncate">
                    {project.locality}, {project.city}
                  </span>
                </p>
              </div>
            </>
          )}
        />

        {/* Top-left: status */}
        {status && (
          <div className="absolute left-3 top-3 z-10">
            <span
              className={`rounded-pill px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm ${
                isReady
                  ? "bg-success/90"
                  : isNew
                    ? "bg-accent/90"
                    : "bg-ink-blue/80"
              }`}
            >
              {status}
            </span>
          </div>
        )}

        {/* Top-right: photo count + compare + favorite */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {images.length > 1 && (
            <span className="rounded-pill bg-black/35 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {images.length} photos
            </span>
          )}
          <CompareToggle slug={project.slug} size="lg" />
          <SaveToggle projectId={project.id} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 px-2 pb-1 pt-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {project.builder.logo ? (
            <img
              src={fileUrl(project.builder.logo) ?? ""}
              alt=""
              className="h-4 w-4 shrink-0 rounded-full object-contain"
            />
          ) : (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-blue text-[9px] font-bold text-white">
              {project.builder.companyName.charAt(0)}
            </span>
          )}
          <span className="truncate">{project.builder.companyName}</span>
          <BadgeCheck size={14} strokeWidth={2.2} className="shrink-0 text-accent" aria-label="Verified builder" />
        </p>

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-mono text-xl font-semibold tracking-tight text-slate-900">
              {formatPrice(project.priceStartingFrom)}
              {project.priceStartingFrom !== null && (
                <span className="ml-0.5 text-accent-dark">+</span>
              )}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              Starting price
            </p>
          </div>
          <span className="flex h-11 w-[118px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 shadow-card transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:border-ink-blue group-hover:bg-ink-blue group-hover:text-white group-hover:shadow-card-hover">
            View Details
            <ArrowRight
              size={14}
              strokeWidth={2.4}
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
