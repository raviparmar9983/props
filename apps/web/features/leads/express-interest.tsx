"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "../../components/bottom-sheet";
import { PillButton } from "../../components/pill-button";
import { InterestForm, type UnitOption } from "./interest-form";

interface ExpressInterestProps {
  projectId: string;
  builderName: string;
  startingPriceLabel: string;
  availableCount: number;
  unitTypes: UnitOption[];
}

export function ExpressInterest({
  projectId,
  builderName,
  startingPriceLabel,
  availableCount,
  unitTypes,
}: ExpressInterestProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setBarVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Mobile: sticky bottom CTA bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-sticky-bar)] backdrop-blur-md transition-transform duration-[var(--duration-slow)] ease-[var(--ease-spring)] lg:hidden ${
          barVisible ? "translate-y-0" : "translate-y-[120%]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-slate-900">
              Starting {startingPriceLabel}
            </p>
            {availableCount > 0 && (
              <p className="text-xs font-medium text-success">
                {availableCount} unit{availableCount !== 1 ? "s" : ""} left
              </p>
            )}
          </div>
          <PillButton
            onClick={() => setSheetOpen(true)}
            className="shrink-0 px-6"
          >
            Express Interest
          </PillButton>
        </div>
      </div>

      {/* Desktop: sticky sidebar card */}
      <div className="sticky top-24 hidden w-80 shrink-0 lg:block">
        <div className="rounded-card border border-slate-200 bg-surface p-6 shadow-card">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Starting
            </p>
            {availableCount > 0 && (
              <span className="rounded-pill bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                {availableCount} left
              </span>
            )}
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">
            {startingPriceLabel}
          </p>
          <div className="my-5 h-px bg-slate-100" />
          <InterestForm
            projectId={projectId}
            unitTypes={unitTypes}
            builderName={builderName}
          />
        </div>
      </div>

      {/* Mobile: express interest bottom sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Express Interest"
        subtitle={`${builderName} will reach out to you.`}
      >
        <InterestForm
          projectId={projectId}
          unitTypes={unitTypes}
          builderName={builderName}
          onSubmitted={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </>
  );
}
