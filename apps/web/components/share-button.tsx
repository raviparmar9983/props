"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "../lib/toast";

interface ShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, url, className = "" }: ShareButtonProps) {
  const [bounce, setBounce] = useState(false);

  async function handleShare() {
    setBounce(true);
    window.setTimeout(() => setBounce(false), 320);

    const fullUrl = url.startsWith("http")
      ? url
      : `${window.location.origin}${url}`;
    const shareData = { title, url: fullUrl };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled the native sheet — fall through to copy fallback.
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied", "Share");
    } catch {
      toast.error("Could not copy the link", "Share");
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share property"
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-card backdrop-blur-sm transition-all duration-[var(--duration-fast)] hover:scale-110 active:scale-95 ${
        bounce ? "animate-heart-bounce" : ""
      } ${className}`}
    >
      <Share2 size={20} strokeWidth={2} aria-hidden />
    </button>
  );
}
