"use client";

import { GitCompareArrows } from "lucide-react";
import { useCompareSelection } from "../lib/compareSelection";
import { toast } from "../lib/toast";

interface CompareToggleProps {
  slug: string;
  className?: string;
  size?: "sm" | "lg";
}

export function CompareToggle({ slug, className = "", size = "sm" }: CompareToggleProps) {
  const { isSelected, toggle } = useCompareSelection();
  const selected = isSelected(slug);

  return (
    <button
      type="button"
      aria-label={selected ? "Remove from compare" : "Add to compare"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = toggle(slug);
        if (result.rejected) {
          toast.error("You can compare up to 3 properties. Remove one to add this.", "Compare limit");
        }
      }}
      className={`flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
        size === "lg" ? "h-10 w-10" : "h-8 w-8"
      } ${
        selected
          ? "animate-heart-bounce bg-accent text-white shadow-md"
          : "bg-white/80 text-slate-600 hover:bg-white hover:text-accent backdrop-blur-sm"
      } ${className}`}
    >
      <GitCompareArrows size={size === "lg" ? 18 : 15} strokeWidth={2} />
    </button>
  );
}
