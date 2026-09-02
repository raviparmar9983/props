"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  Building2,
  CalendarDays,
  ChevronRight,
  PackageCheck,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { BottomSheet } from "../../components/bottom-sheet";
import { PillButton } from "../../components/pill-button";
import { InterestForm, type UnitOption } from "./interest-form";

interface ExpressInterestProps {
  projectId: string;
  builderName: string;
  startingPriceLabel: string;
  availableCount: number;
  unitTypes: UnitOption[];
  propertyTypeLabel?: string | null;
  configuration?: string | null;
  possessionLabel?: string | null;
}

export function ExpressInterest({
  projectId,
  builderName,
  startingPriceLabel,
  availableCount,
  unitTypes,
  propertyTypeLabel,
  configuration,
  possessionLabel,
}: ExpressInterestProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setBarVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    propertyTypeLabel && {
      icon: Building2,
      label: "Property type",
      value: propertyTypeLabel,
    },
    configuration && {
      icon: BedDouble,
      label: "Configuration",
      value: configuration,
    },
    possessionLabel && {
      icon: CalendarDays,
      label: "Possession",
      value: possessionLabel,
    },
    {
      icon: PackageCheck,
      label: "Availability",
      value:
        availableCount > 0
          ? `${availableCount} unit${availableCount !== 1 ? "s" : ""} available`
          : "Sold out",
    },
  ].filter((f): f is { icon: LucideIcon; label: string; value: string } =>
    Boolean(f),
  );

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
              {startingPriceLabel}
              {startingPriceLabel !== "On request" && (
                <span className="text-accent-dark">+</span>
              )}
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
            Contact Builder
          </PillButton>
        </div>
      </div>

      {/* Desktop: sticky sidebar enquiry card */}
      <div className="sticky top-24 hidden w-[340px] shrink-0 lg:block xl:w-[360px]">
        <div className="overflow-hidden rounded-card-xl border border-slate-200 bg-surface shadow-card">
          {/* Price block */}
          <div className="px-6 pb-5 pt-6">
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Starting from
            </p>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <p className="font-display text-[28px] font-bold leading-none text-slate-900">
                {startingPriceLabel}
              </p>
              {availableCount > 0 && (
                <span className="rounded-pill bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                  {availableCount} left
                </span>
              )}
            </div>
          </div>

          {/* Key facts */}
          {facts.length > 0 && (
            <div className="space-y-2.5 border-t border-slate-100 px-6 py-4">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-accent-soft/70 text-accent-dark">
                    <f.icon size={13} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="text-xs text-slate-400">{f.label}</span>
                  <span className="ml-auto truncate text-sm font-semibold text-slate-800">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Enquiry form / success state */}
          <div className="border-t border-slate-100 px-6 pb-5 pt-5">
            <InterestForm
              projectId={projectId}
              unitTypes={unitTypes}
              builderName={builderName}
            />
            <a
              href="#contacts"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-[var(--duration-fast)] hover:border-accent/40 hover:text-accent active:scale-[0.98]"
            >
              <Phone size={15} strokeWidth={2.2} aria-hidden />
              View Number
              <ChevronRight size={14} aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile: express interest bottom sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Contact builder"
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
