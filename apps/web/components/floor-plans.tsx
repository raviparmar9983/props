"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import type { GalleryMedia } from "./media-gallery";
import { MediaLightbox } from "./media-lightbox";
import { fileUrl } from "../lib/format";

interface FloorPlansProps {
  media: GalleryMedia[];
}

export function FloorPlans({ media }: FloorPlansProps) {
  const plans = media
    .filter((m) => m.type === "FLOOR_PLAN" || m.type === "MASTER_PLAN")
    .map((m) => ({ ...m, url: fileUrl(m.url) ?? m.url }));

  const brochure = media.find((m) => m.type === "BROCHURE");
  const brochureUrl = brochure ? fileUrl(brochure.url) : null;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (plans.length === 0 && !brochureUrl) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        Floor plans & brochures
      </h2>

      <div className="mt-3 flex items-start gap-4">
        {plans.length > 0 && (
          <div className="no-scrollbar -mx-4 flex flex-1 gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {plans.map((plan, i) => (
              <button
                key={plan.id}
                onClick={() => {
                  setStartIndex(i);
                  setLightboxOpen(true);
                }}
                aria-label={`View floor plan ${i + 1}`}
                className="relative h-36 w-48 shrink-0 overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card transition-all duration-[var(--duration-base)] hover:shadow-card-hover active:scale-[0.98]"
              >
                <img
                  src={plan.url}
                  alt={`Floor plan ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-pill bg-black/40 text-white backdrop-blur-sm">
                  <FileText size={13} aria-hidden />
                </span>
              </button>
            ))}
          </div>
        )}

        {brochureUrl && (
          <a
            href={brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-white shadow-accent-button transition-colors hover:bg-accent-dark active:scale-[0.98]"
          >
            <Download size={16} aria-hidden />
            Download brochure
          </a>
        )}
      </div>

      {plans.length > 0 && (
        <MediaLightbox
          items={plans}
          open={lightboxOpen}
          initialIndex={startIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}
