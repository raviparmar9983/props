"use client";

import { useState } from "react";
import { MediaGallery, type GalleryMedia } from "./media-gallery";
import { MediaLightbox } from "./media-lightbox";

interface ProjectMediaProps {
  media: GalleryMedia[];
  alt: string;
  projectId?: string | undefined;
  shareTitle?: string | undefined;
  shareUrl?: string | undefined;
}

export function ProjectMedia({
  media,
  alt,
  projectId,
  shareTitle,
  shareUrl,
}: ProjectMediaProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <MediaGallery
        media={media}
        alt={alt}
        projectId={projectId}
        shareTitle={shareTitle}
        shareUrl={shareUrl}
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
