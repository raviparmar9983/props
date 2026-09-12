"use client";

import Link from "next/link";
import type { PublicProjectSummary } from "../types/public";
import { formatPrice, fileUrl } from "../lib/format";
import { ArrowRight, CheckCircle2, Heart, MapPin, ShieldCheck } from "lucide-react";
import { CompareToggle } from "./compare-toggle";
import { SaveToggle } from "./save-toggle";

interface HorizontalProjectCardProps {
  project: PublicProjectSummary;
}

export function HorizontalProjectCard({ project }: HorizontalProjectCardProps) {
  const images = (project.media?.length ? project.media : [project.primaryImageUrl])
    .map(fileUrl)
    .filter((u): u is string => u !== null);

  const primaryImg = images[0] ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";

  let statusBadge = { label: "Move-in Ready", bg: "bg-emerald-600" };
  if (project.status === "UPCOMING") {
    statusBadge = { label: "New Launch", bg: "bg-blue-600" };
  } else if (project.status === "UNDER_CONSTRUCTION") {
    statusBadge = { label: "Under Construction", bg: "bg-amber-500" };
  }

  // Derive sample specs for display matching screenshot 2
  const mainUnit = project.unitTypes?.[0];
  const bhkLabel = mainUnit?.bedrooms ? `${mainUnit.bedrooms} BHK` : "3 BHK";
  const areaLabel = mainUnit?.carpetArea ? `${mainUnit.carpetArea.toLocaleString()} sq.ft` : "1,220 sq.ft";
  const possessionLabel = project.possessionDate
    ? new Date(project.possessionDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : project.status === "READY" ? "Ready to Move" : "Mar 2028";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-slate-200 hover:shadow-md md:flex-row">
      {/* Image left column */}
      <div className="relative h-48 md:h-auto md:w-64 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={primaryImg}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Status Badge */}
        <div className="absolute left-3 top-3 z-10 flex gap-1.5">
          <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
          {project.reraProjectNumber && (
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
              <ShieldCheck size={12} /> RERA
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <div className="absolute right-3 top-3 z-10">
          <SaveToggle projectId={project.id} />
        </div>
      </div>

      {/* Content right column */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/projects/${project.slug}`}>
                <h3 className="font-bold text-lg text-ink-blue hover:text-accent transition-colors">
                  {project.title}
                </h3>
              </Link>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={13} className="shrink-0 text-slate-400" />
                {project.locality}, {project.city}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">{project.builder.companyName}</span>
                <CheckCircle2 size={14} className="text-amber-500 fill-amber-100" />
              </div>
            </div>

            {/* Price Tag */}
            <div className="text-right">
              <p className="font-bold text-xl text-slate-900">
                {formatPrice(project.priceStartingFrom)}
                <span className="text-slate-900">+</span>
              </p>
              <p className="text-[10px] text-slate-400">Starting Price</p>
            </div>
          </div>

          {/* Specs tags row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {bhkLabel}
            </span>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {areaLabel}
            </span>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {possessionLabel}
            </span>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <CompareToggle slug={project.slug} />
            <span className="text-xs font-medium text-slate-600">Compare</span>
          </div>

          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition-colors hover:border-accent hover:bg-accent hover:text-white"
          >
            View Details
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
