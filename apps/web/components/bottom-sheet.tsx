"use client";

import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  dismissible?: boolean;
  footer?: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  dismissible = true,
  footer,
  children,
}: PropsWithChildren<BottomSheetProps>) {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, dismissible]);

  function onPointerDown(e: React.PointerEvent) {
    if (!dismissible) return;
    startY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dy = e.clientY - startY.current;
    setDragOffset(dy > 0 ? dy : 0);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    if (dragOffset > 110) {
      onClose();
    }
    setDragOffset(0);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        className={`absolute inset-0 bg-ink-blue/40 transition-opacity duration-[var(--duration-base)] ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => dismissible && onClose()}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[min(85vh,calc(100dvh-2rem))] w-full flex-col rounded-t-card bg-surface shadow-[var(--shadow-card-hover)] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-spring)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: dragging ? `translateY(${dragOffset}px)` : undefined,
        }}
      >
        {/* Drag handle */}
        <div
          className="flex cursor-grab touch-none items-center justify-center pt-3 pb-1 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden
        >
          <div className="h-1.5 w-12 rounded-pill bg-slate-200" />
        </div>

        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-2 pb-3">
            <div>
              {title && (
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
            {dismissible && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-[var(--duration-fast)] hover:bg-slate-200 active:scale-90"
              >
                <X size={16} strokeWidth={2.5} aria-hidden />
              </button>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-surface px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
