"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Images, Play } from "lucide-react";
import { fileUrl } from "../lib/format";
import { ResilientImage } from "./resilient-image";
import { SaveToggle } from "./save-toggle";
import { ShareButton } from "./share-button";

export interface GalleryMedia {
  id: string;
  type: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface MediaGalleryProps {
  media: GalleryMedia[];
  alt: string;
  onOpen: (index: number) => void;
  projectId?: string | undefined;
  shareTitle?: string | undefined;
  shareUrl?: string | undefined;
}

const GALLERY_TYPES = new Set(["IMAGE", "VIDEO"]);
const VISIBLE_THUMBS = 6;

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MediaThumb({
  item,
  active,
  onClick,
  label,
}: {
  item: GalleryMedia;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`h-14 w-full min-h-0 flex-1 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-[var(--duration-fast)] ${
        active
          ? "border-accent opacity-100 shadow-card-hover"
          : "border-transparent opacity-70 hover:opacity-100"
      }`}
    >
      {item.type === "VIDEO" ? (
        <div className="relative flex h-full w-full items-center justify-center bg-ink-blue">
          <Play size={14} fill="white" className="text-white" aria-hidden />
        </div>
      ) : (
        <ResilientImage src={item.url} alt="" />
      )}
    </button>
  );
}

function MediaOverlayButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md backdrop-blur-md transition-all duration-[var(--duration-fast)] hover:scale-105 hover:bg-white active:scale-95"
    >
      {children}
    </button>
  );
}

export function MediaGallery({
  media,
  alt,
  onOpen,
  projectId,
  shareTitle,
  shareUrl,
}: MediaGalleryProps) {
  const router = useRouter();

  const items = useMemo(
    () =>
      media
        .filter((m) => GALLERY_TYPES.has(m.type))
        .map((m) => ({ ...m, url: fileUrl(m.url) ?? m.url }))
        .sort(
          (a, b) =>
            Number(b.isPrimary) - Number(a.isPrimary) ||
            a.displayOrder - b.displayOrder,
        ),
    [media],
  );

  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [didSwipe, setDidSwipe] = useState(false);
  const [durations, setDurations] = useState<Record<string, string>>({});
  const startX = useRef(0);
  const startY = useRef(0);
  const horizontal = useRef(false);

  const count = items.length;
  const last = count - 1;
  const current = items[index]!;

  if (count === 0) {
    return (
      <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-ink-blue to-slate-800 sm:aspect-[16/9] md:aspect-[16/10] md:rounded-[24px]">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <Building2
            size={48}
            strokeWidth={1.5}
            opacity={0.4}
            className="text-white"
            aria-hidden
          />
          <p className="text-sm font-medium text-white/70">
            Photos coming soon
          </p>
        </div>
      </div>
    );
  }

  function onTouchStart(e: React.TouchEvent) {
    if (count <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    horizontal.current = false;
    setDragging(true);
    setDidSwipe(false);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging || count <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - startX.current;
    const y = touch.clientY - startY.current;
    if (!horizontal.current) {
      if (Math.abs(x) < 8 && Math.abs(y) < 8) return;
      horizontal.current = Math.abs(x) > Math.abs(y);
    }
    if (!horizontal.current) return;
    let next = x;
    if (index === 0 && x > 0) next = x * 0.35;
    if (index === last && x < 0) next = x * 0.35;
    setDx(next);
  }

  function onTouchEnd() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dx) > 56) {
      setDidSwipe(true);
      if (dx < 0) setIndex((i) => Math.min(i + 1, last));
      else setIndex((i) => Math.max(i - 1, 0));
    }
    setDx(0);
  }

  function handleClick() {
    if (didSwipe) {
      setDidSwipe(false);
      return;
    }
    onOpen(index);
  }

  const thumbnails = items.slice(0, VISIBLE_THUMBS);
  const hiddenCount = count - VISIBLE_THUMBS;

  return (
    <div className="md:flex md:items-stretch md:gap-2">
      {/* Main media frame */}
      <div
        className="group relative w-full overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/10] md:flex-1 md:rounded-[24px]"
        style={{ touchAction: "pan-y" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dx}px))`,
            transition: dragging ? "none" : "transform 0.3s var(--ease-standard)",
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`h-full w-full shrink-0 ${
                item.type !== "VIDEO"
                  ? "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  : ""
              }`}
            >
              {item.type === "VIDEO" ? (
                <video
                  src={item.url}
                  controls
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const d = formatDuration(e.currentTarget.duration);
                    if (d) {
                      setDurations((prev) =>
                        prev[item.id] === d ? prev : { ...prev, [item.id]: d },
                      );
                    }
                  }}
                  className="h-full w-full select-none object-cover"
                />
              ) : (
                <ResilientImage
                  src={item.url}
                  alt={`${alt} photo ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  draggable={false}
                  onClick={handleClick}
                  wrapperClassName="h-full w-full shrink-0 cursor-pointer select-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Video play badge */}
        {current.type === "VIDEO" && (
          <span className="pointer-events-none absolute bottom-14 right-3 z-10 inline-flex items-center gap-1.5 rounded-pill bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Play size={12} fill="currentColor" aria-hidden />
            {durations[current.id] ?? "Video"}
          </span>
        )}

        {/* Floating back button */}
        <div className="absolute left-3 top-3 z-10">
          <MediaOverlayButton
            label="Go back"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} strokeWidth={2.2} aria-hidden />
          </MediaOverlayButton>
        </div>

        {/* Favorite + share */}
        {(projectId || shareUrl) && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            {projectId && <SaveToggle projectId={projectId} />}
            {shareUrl && shareTitle && (
              <ShareButton title={shareTitle} url={shareUrl} />
            )}
          </div>
        )}

        {/* Count pill */}
        <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-pill bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm md:bottom-16">
          {index + 1} / {count}
        </span>

        {/* Dots */}
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-pill bg-black/30 px-2 py-1 backdrop-blur-sm md:bottom-16">
            {items.map((item, i) => (
              <button
                key={item.id}
                aria-label={`Go to media ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-pill transition-all duration-[var(--duration-fast)] ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* View all photos */}
        {count > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(index);
            }}
            className="absolute bottom-3 right-3 z-10 hidden items-center gap-1.5 rounded-pill bg-white/95 px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-md backdrop-blur-md transition-all duration-[var(--duration-fast)] hover:bg-white hover:shadow-lg active:scale-95 sm:inline-flex md:bottom-16"
          >
            <Images size={14} strokeWidth={2.2} aria-hidden />
            View all {count} photos
          </button>
        )}
      </div>

      {/* Desktop: floating thumbnail rail (padded clear of the overlapping header) */}
      <div className="hidden w-[104px] flex-col gap-2 pb-14 md:flex">
        {thumbnails.map((item, i) => (
          <MediaThumb
            key={item.id}
            item={item}
            active={i === index}
            onClick={() => setIndex(i)}
            label={`View media ${i + 1}`}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => onOpen(0)}
            className="flex w-full flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-surface text-xs font-semibold text-slate-600 transition-colors hover:border-accent/40 hover:text-accent"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>

      {/* Mobile: thumbnail strip */}
      {count > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 md:hidden">
          {thumbnails.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              aria-label={`View media ${i + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-[var(--duration-fast)] ${
                i === index
                  ? "border-accent opacity-100"
                  : "border-transparent opacity-70"
              }`}
            >
              {item.type === "VIDEO" ? (
                <div className="relative flex h-full w-full items-center justify-center bg-ink-blue">
                  <Play size={14} fill="white" className="text-white" aria-hidden />
                </div>
              ) : (
                <ResilientImage
                  src={item.url}
                  alt=""
                  wrapperClassName="h-full w-full"
                />
              )}
            </button>
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={() => onOpen(0)}
              className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600"
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
