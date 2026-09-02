"use client";

import { useEffect, useState } from "react";
import { subscribe, dismiss, type ToastItem } from "../lib/toast";
import { Check, X, Info, type LucideIcon } from "lucide-react";

const ICON_BG: Record<ToastItem["type"], string> = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  info: "bg-ink-blue text-white",
};

const ICON_ICON: Record<ToastItem["type"], LucideIcon> = {
  success: Check,
  error: X,
  info: Info,
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setItems), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((item) => {
        const Icon = ICON_ICON[item.type];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => dismiss(item.id)}
            className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-card border border-slate-200 bg-surface p-3.5 text-left shadow-card-hover"
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill ${ICON_BG[item.type]}`}
            >
              <Icon size={14} strokeWidth={2.5} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              {item.title && (
                <span className="block text-sm font-semibold text-slate-900">
                  {item.title}
                </span>
              )}
              <span className="block text-sm text-slate-600">{item.message}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
