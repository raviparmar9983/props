"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import type { GalleryMedia } from "./media-gallery";
import { fileUrl } from "../lib/format";

interface MediaLightboxProps {
  items: GalleryMedia[];
  open: boolean;
  initialIndex: number;
  onClose: () => void;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function MediaLightbox({
  items,
  open,
  initialIndex,
  onClose,
}: MediaLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [didSwipe, setDidSwipe] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, tx: 0, ty: 0 });

  const startX = useRef(0);
  const horizontal = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    dist: number;
    scale: number;
    tx: number;
    ty: number;
  } | null>(null);
  const lastTap = useRef(0);

  const count = items.length;
  const last = count - 1;
  const current = items[index];
  const isImage = current?.type === "IMAGE";

  const resetZoom = useCallback(() => {
    setZoom({ scale: 1, tx: 0, ty: 0 });
    pointers.current.clear();
    gesture.current = null;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setIndex(clamp(i, 0, last));
      setDx(0);
      resetZoom();
    },
    [last, resetZoom],
  );

  useEffect(() => {
    if (open) {
      goTo(initialIndex);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open, initialIndex, goTo]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, goTo, onClose]);

  if (!open || count === 0) return null;

  // ── Swipe (touch, only when not zoomed) ──
  function onTouchStart(e: React.TouchEvent) {
    if (count <= 1 || zoom.scale > 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    startX.current = touch.clientX;
    horizontal.current = false;
    setDragging(true);
    setDidSwipe(false);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging || count <= 1 || zoom.scale > 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - startX.current;
    if (!horizontal.current && Math.abs(x) > 8) horizontal.current = true;
    if (!horizontal.current) return;
    let next = x;
    if (index === 0 && x > 0) next = x * 0.3;
    if (index === last && x < 0) next = x * 0.3;
    setDx(next);
  }

  function onTouchEnd() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dx) > 56) {
      setDidSwipe(true);
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    }
    setDx(0);
  }

  // ── Pinch / pan (pointer events on images) ──
  function onPointerDown(e: React.PointerEvent) {
    if (!isImage) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        dist: Math.hypot(a!.x - b!.x, a!.y - b!.y),
        scale: zoom.scale,
        tx: zoom.tx,
        ty: zoom.ty,
      };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    const prev = { ...p };
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (gesture.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const scale = clamp((gesture.current.dist > 0 ? dist / gesture.current.dist : 1) * gesture.current.scale, 1, 3);
      setZoom({ scale, tx: gesture.current.tx, ty: gesture.current.ty });
      return;
    }

    if (pointers.current.size === 1 && zoom.scale > 1) {
      const dtx = e.clientX - prev.x;
      const dty = e.clientY - prev.y;
      setZoom((z) => ({ ...z, tx: z.tx + dtx, ty: z.ty + dty }));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0 && zoom.scale < 1.05) resetZoom();
  }

  function onDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setZoom(zoom.scale > 1 ? { scale: 1, tx: 0, ty: 0 } : { scale: 2, tx: 0, ty: 0 });
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-black/95 transition-all duration-[var(--duration-slow)] ease-[var(--ease-standard)] ${
        open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 md:translate-y-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Media gallery"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <span className="rounded-pill bg-black/40 px-3 py-1 text-sm font-medium text-white">
          {index + 1}/{count}
        </span>
        <button
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 active:scale-90"
        >
          <X size={20} strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      {/* Stage */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ touchAction: "pan-y" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${zoom.scale > 1 ? 0 : dx}px))`,
            transition: dragging ? "none" : "transform 0.3s var(--ease-standard)",
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex h-full w-full shrink-0 items-center justify-center"
            >
              {item.type === "VIDEO" ? (
                <video
                  src={fileUrl(item.url) ?? item.url}
                  controls
                  playsInline
                  autoPlay={i === index}
                  className="max-h-full max-w-full"
                />
              ) : (
                <img
                  src={fileUrl(item.url) ?? item.url}
                  alt={`Photo ${i + 1}`}
                  draggable={false}
                  onClick={onDoubleTap}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className="max-h-full max-w-full touch-none select-none object-contain"
                  style={
                    i === index
                      ? {
                          transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.scale})`,
                          transition: dragging ? "none" : "transform 0.15s var(--ease-standard)",
                          cursor: zoom.scale > 1 ? "grab" : "zoom-in",
                        }
                      : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-4 pt-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => goTo(i)}
              aria-label={`View media ${i + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-image border-2 transition-all duration-[var(--duration-fast)] ${
                i === index ? "border-accent" : "border-white/20 opacity-70"
              }`}
            >
              {item.type === "VIDEO" ? (
                <div className="relative flex h-full w-full items-center justify-center bg-ink-blue">
                  <Play size={16} fill="white" className="text-white" aria-hidden />
                </div>
              ) : (
                <img
                  src={fileUrl(item.url) ?? item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
