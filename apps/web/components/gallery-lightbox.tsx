"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageCarousel } from "./image-carousel";
import { BottomSheet } from "./bottom-sheet";
import { fileUrl } from "../lib/format";
import { ChevronLeft, Images } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  type: string;
  isPrimary: boolean;
}

export function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const urls = images
    .map((img) => fileUrl(img.url))
    .filter((u): u is string => u !== null);
  const count = urls.length;

  if (count === 0) return null;

  return (
    <>
      {/* Full-bleed hero carousel */}
      <ImageCarousel
        images={urls}
        alt="Project"
        aspectClassName="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/10]"
        rounded={false}
        onOpen={(i) => {
          setStartIndex(i);
          setGalleryOpen(true);
        }}
        overlay={() => (
          <>
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-90"
            >
              <ChevronLeft size={18} strokeWidth={2.4} aria-hidden />
            </button>
            {count > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStartIndex(0);
                  setGalleryOpen(true);
                }}
                className="absolute top-4 right-4 flex items-center gap-1.5 rounded-pill bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <Images size={14} strokeWidth={2} aria-hidden />
                {count} photos
              </button>
            )}
          </>
        )}
      />

      {/* Full gallery */}
      <BottomSheet
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title="All photos"
        subtitle={`${count} photo${count !== 1 ? "s" : ""}`}
      >
        <div className="pb-6">
          <ImageCarousel
            key={startIndex}
            images={urls}
            alt="Project"
            initialIndex={startIndex}
            aspectClassName="h-[58vh] w-full"
            rounded={false}
          />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {urls.map((url, i) => (
              <button
                key={url}
                onClick={() => setStartIndex(i)}
                aria-label={`Photo ${i + 1}`}
                className="aspect-square overflow-hidden rounded-image"
              >
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-[var(--duration-base)] hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
