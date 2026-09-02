"use client";

import { useRef, useState, type ReactNode } from "react";
import { Building2 } from "lucide-react";
import { ResilientImage } from "./resilient-image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  aspectClassName?: string;
  onOpen?: (index: number) => void;
  overlay?: (index: number, count: number) => ReactNode;
  className?: string;
  showDots?: boolean;
  rounded?: boolean;
  initialIndex?: number;
}

export function ImageCarousel({
  images,
  alt,
  aspectClassName = "aspect-[16/10]",
  onOpen,
  overlay,
  className = "",
  showDots = true,
  rounded = true,
  initialIndex = 0,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(initialIndex);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [didSwipe, setDidSwipe] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const horizontal = useRef(false);

  const count = images.length;
  const last = count - 1;

  if (count === 0) {
    return (
      <div
        className={`flex items-center justify-center ${aspectClassName} ${
          rounded ? "rounded-image" : ""
        } bg-gradient-to-br from-ink-blue to-slate-800`}
      >
        <Building2
          size={48}
          strokeWidth={1.5}
          opacity={0.35}
          className="text-white"
          aria-hidden
        />
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
    onOpen?.(index);
  }

  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-image" : "rounded-none"} ${aspectClassName} ${className}`}
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
        {images.map((src, i) => (
          <ResilientImage
            key={`${src}-${i}`}
            src={src}
            alt={`${alt} photo ${i + 1}`}
            draggable={false}
            onClick={onOpen ? handleClick : undefined}
            wrapperClassName="h-full w-full shrink-0 cursor-pointer select-none"
          />
        ))}
      </div>

      {overlay && overlay(index, count)}

      {showDots && count > 1 && (
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-pill bg-black/30 px-2 py-1 backdrop-blur-sm">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to photo ${i + 1}`}
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
    </div>
  );
}
