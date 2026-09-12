"use client";

import Link from "next/link";
import type { PublicProjectSummary } from "../types/public";
import { ImageCarousel } from "./image-carousel";
import { SaveToggle } from "./save-toggle";
import { formatPrice, fileUrl } from "../lib/format";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";

interface ProjectCardProps {
  project: PublicProjectSummary;
  index?: number;
}

function getStatusBadge(status: string) {
  if (status === "READY" || status === "READY_TO_MOVE") {
    return { label: "Move-In Ready", bg: "bg-emerald-600" };
  }
  if (status === "UPCOMING") {
    return { label: "Upcoming", bg: "bg-amber-500" };
  }
  return { label: "New Launch", bg: "bg-blue-600" };
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const images = (project.media?.length ? project.media : [project.primaryImageUrl])
    .map(fileUrl)
    .filter((u): u is string => u !== null);

  const badge = getStatusBadge(project.status);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative">
        <ImageCarousel
          images={images.length ? images : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"]}
          alt={project.title}
          initialIndex={0}
          priority={index === 0}
          aspectClassName="aspect-[4/3]"
          rounded={false}
          className="w-full"
          showDots={false}
          showArrows={false}
        />

        {/* Top-left: status badge */}
        <div className="absolute left-3 top-3 z-10">
          <span
            className={`rounded-md px-3 py-1 text-[11px] font-bold text-white shadow-sm ${badge.bg}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Top-right: Heart wishlist icon */}
        <div className="absolute right-3 top-3 z-10">
          <SaveToggle projectId={project.id} />
        </div>

        {/* Bottom-right: Photo Count Pill */}
        <div className="absolute right-3 bottom-3 z-10">
          <span className="rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            {images.length || 5} photos
          </span>
        </div>
      </div>

      {/* Card Info Section below image */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 truncate group-hover:text-accent transition-colors">
          {project.title}
        </h3>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 truncate">
          <MapPin size={13} className="shrink-0 text-slate-400" aria-hidden />
          <span className="truncate">
            {project.locality}, {project.city}
          </span>
        </p>

        {/* Builder */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
          <span className="truncate font-semibold">{project.builder.companyName}</span>
          <CheckCircle2 size={14} className="shrink-0 text-amber-500 fill-amber-100" />
        </div>

        {/* Price & CTA Row */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="font-bold text-base text-slate-900">
              {formatPrice(project.priceStartingFrom)}
              <span className="text-slate-900">+</span>
            </p>
            <p className="text-[10px] text-slate-400">Starting Price</p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
            View Details
            <ArrowRight size={13} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

