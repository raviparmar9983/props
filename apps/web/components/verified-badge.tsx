"use client";

import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  showLabel?: boolean;
  size?: number;
}

export function VerifiedBadge({ showLabel = false, size = 14 }: VerifiedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-rating-gold/15 px-1.5 py-0.5 text-xs font-semibold text-[#9A6B12]">
      <BadgeCheck
        size={size}
        fill="#E8A845"
        stroke="white"
        strokeWidth={1.5}
        aria-hidden
      />
      {showLabel && <span>Verified</span>}
    </span>
  );
}
