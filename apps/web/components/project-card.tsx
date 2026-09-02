"use client";

import Link from "next/link";
import type { PublicProjectSummary } from "../types/public";
import { ImageCarousel } from "./image-carousel";
import { CompareToggle } from "./compare-toggle";
import { formatPrice, formatStatusLabel, fileUrl } from "../lib/format";
import { BadgeCheck, MapPin } from "lucide-react";

interface ProjectCardProps {
  project: PublicProjectSummary;
  index?: number;
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
      className="group animate-fade-rise flex flex-col overflow-hidden rounded-card bg-surface shadow-card transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98]"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      <div className="relative">
        <ImageCarousel
          images={images}
          alt={project.title}
          aspectClassName="aspect-[4/3]"
          showDots={images.length > 1}
          overlay={() => (
            <>
              {status && (
                <span
                  className={`absolute bottom-3 left-3 rounded-pill px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm ${
                    isReady
                      ? "bg-success"
                      : isNew
                        ? "bg-accent"
                        : "bg-ink-blue/70"
                  }`}
                >
                  {status}
                </span>
              )}
              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 rounded-pill bg-black/35 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  {images.length} photos
                </span>
              )}
            </>
          )}
        />
        <span className="absolute top-3 right-3 z-10">
          <CompareToggle slug={project.slug} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-slate-900 group-hover:text-accent-dark">
          {project.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-slate-400">
          <MapPin size={12} strokeWidth={2} className="shrink-0" aria-hidden />
          <span className="truncate">
            {project.locality}, {project.city}
          </span>
        </p>

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

        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="font-mono text-lg font-semibold tracking-tight text-slate-900">
            {formatPrice(project.priceStartingFrom)}
            {project.priceStartingFrom !== null && (
              <span className="ml-1 text-xs font-medium text-slate-400">
                onwards
              </span>
            )}
          </span>
          {project.propertyTypes.slice(0, 2).map((pt) => (
            <span
              key={pt}
              className="rounded-pill bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
            >
              {pt.charAt(0) + pt.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
