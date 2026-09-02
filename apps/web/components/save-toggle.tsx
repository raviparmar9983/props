"use client";

import { Heart } from "lucide-react";
import {
  useAuth,
  useIsSaved,
  useSaveProperty,
  useUnsaveProperty,
} from "../lib/hooks";
import { useAuthSheet } from "../lib/auth-sheet-store";
import { setPendingAction } from "../lib/pendingAction";

interface SaveToggleProps {
  projectId: string;
  className?: string;
}

export function SaveToggle({ projectId, className = "" }: SaveToggleProps) {
  const { user } = useAuth();
  const openSheet = useAuthSheet((s) => s.openSheet);
  const saved = useIsSaved(projectId);
  const save = useSaveProperty();
  const unsave = useUnsaveProperty();

  const isCustomer = user?.role === "CUSTOMER";
  const isPending = save.isPending || unsave.isPending;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isCustomer) {
      setPendingAction({ type: "SAVE_PROPERTY", projectId });
      openSheet();
      return;
    }
    if (saved) unsave.mutate(projectId);
    else save.mutate(projectId);
  }

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save property"}
      aria-pressed={saved}
      disabled={isPending}
      onClick={handleClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-70 ${
        saved
          ? "animate-heart-bounce bg-white text-rose-500 backdrop-blur-md"
          : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-rose-500"
      } ${className}`}
    >
      <Heart
        size={17}
        strokeWidth={2.2}
        fill={saved ? "currentColor" : "transparent"}
        aria-hidden
      />
    </button>
  );
}
