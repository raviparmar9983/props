"use client";

import { useState } from "react";
import { MediaGallery, type GalleryMedia } from "./media-gallery";
import { MediaLightbox } from "./media-lightbox";

interface ProjectMediaProps {
  media: GalleryMedia[];
  alt: string;
}

export function ProjectMedia({ media, alt }: ProjectMediaProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <MediaGallery
        media={media}
        alt={alt}
        onOpen={(i) => {
          setIndex(i);
          setOpen(true);
        }}
      />
      <MediaLightbox
        items={media}
        open={open}
        initialIndex={index}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
