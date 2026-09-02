"use client";

import { useState } from "react";
import type { UnitTypeSummary } from "../types/public";
import { formatPrice } from "../lib/format";
import { BottomSheet } from "./bottom-sheet";
import { InterestForm } from "../features/leads/interest-form";

interface UnitTypeCardsProps {
  projectId: string;
  builderName: string;
  unitTypes: UnitTypeSummary[];
}

function formatArea(ut: UnitTypeSummary): string {
  if (!ut.carpetArea) return "Area on request";
  const unit = ut.areaUnit === "SQM" ? "sq.m" : "sq.ft";
  return `${ut.carpetArea.toLocaleString("en-IN")} ${unit}`;
}

function formatAttributeValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const items = value.map((v) => formatAttributeValue(v));
    return items.join(", ");
  }
  if (typeof value === "object") {
    try {
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${formatAttributeValue(v)}`)
        .join(", ");
    } catch {
      return "—";
    }
  }
  return String(value);
}

function attributeLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function AttributesList({ attributes }: { attributes: Record<string, unknown> }) {
  const entries = Object.entries(attributes).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-input bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {attributeLabel(key)}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">
            {formatAttributeValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function UnitTypeCards({
  projectId,
  builderName,
  unitTypes,
}: UnitTypeCardsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = unitTypes.find((ut) => ut.id === selectedId) ?? null;

  const baseDetails = (ut: UnitTypeSummary) => {
    const items: { key: string; value: string }[] = [];
    if (ut.carpetArea) {
      items.push({
        key: "Carpet area",
        value: `${ut.carpetArea.toLocaleString("en-IN")} ${ut.areaUnit === "SQM" ? "sq.m" : "sq.ft"}`,
      });
    }
    if (ut.builtUpArea) {
      items.push({
        key: "Built-up area",
        value: `${ut.builtUpArea.toLocaleString("en-IN")} ${ut.areaUnit === "SQM" ? "sq.m" : "sq.ft"}`,
      });
    }
    if (ut.tower?.name) items.push({ key: "Tower", value: ut.tower.name });
    items.push({
      key: "Type",
      value: ut.propertyType.charAt(0) + ut.propertyType.slice(1).toLowerCase(),
    });
    if (ut.floorNumber) items.push({ key: "Floor", value: ut.floorNumber });
    if (ut.facing) {
      items.push({
        key: "Facing",
        value: ut.facing.replace(/_/g, " ").toLowerCase(),
      });
    }
    if (ut.viewType) items.push({ key: "View", value: ut.viewType });
    if (ut.bookingAmount !== null && ut.bookingAmount !== undefined) {
      const amount =
        typeof ut.bookingAmount === "string"
          ? Number(ut.bookingAmount)
          : ut.bookingAmount;
      if (Number.isFinite(amount) && amount > 0) {
        items.push({ key: "Booking amount", value: formatPrice(amount) });
      }
    }
    return items;
  };

  return (
    <>
      {/* Mobile: horizontally swipeable cards */}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:hidden">
        {unitTypes.map((ut) => {
          const available = ut.availableCount > 0;
          return (
            <div
              key={ut.id}
              className={`flex w-56 shrink-0 flex-col gap-2 rounded-card border border-slate-200 bg-surface p-4 shadow-card transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] hover:border-accent/40 hover:shadow-card-hover ${
                available ? "" : "opacity-60"
              }`}
            >
              <span className="font-display text-base font-semibold text-slate-900">
                {ut.label}
              </span>
              <span className="text-sm text-slate-400">{formatArea(ut)}</span>
              <span className="font-display text-lg font-bold text-slate-900">
                {formatPrice(ut.price)}
              </span>
              <span
                className={`mt-auto w-fit rounded-pill px-2 py-0.5 text-xs font-semibold ${
                  available
                    ? "bg-success-soft text-success"
                    : "bg-danger-soft text-danger"
                }`}
              >
                {available
                  ? `${ut.availableCount} unit${ut.availableCount !== 1 ? "s" : ""} available`
                  : "Sold out"}
              </span>
              <button
                onClick={() => setSelectedId(ut.id)}
                className="mt-2 w-full rounded-pill border border-accent/30 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white active:scale-[0.98]"
              >
                View details
              </button>
            </div>
          );
        })}
      </div>

      {/* Desktop: comparison table */}
      <div className="hidden overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              <th className="px-5 py-3">Unit</th>
              <th className="px-5 py-3">Carpet area</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Availability</th>
              <th className="px-5 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {unitTypes.map((ut) => {
              const available = ut.availableCount > 0;
              return (
                <tr
                  key={ut.id}
                  className={`border-b border-slate-100 last:border-0 ${
                    available ? "" : "opacity-60"
                  }`}
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {ut.label}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatArea(ut)}</td>
                  <td className="px-5 py-4 font-display font-bold text-slate-900">
                    {formatPrice(ut.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${
                        available
                          ? "bg-success-soft text-success"
                          : "bg-danger-soft text-danger"
                      }`}
                    >
                      {available
                        ? `${ut.availableCount} unit${ut.availableCount !== 1 ? "s" : ""} available`
                        : "Sold out"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedId(ut.id)}
                      className="rounded-pill border border-accent/30 px-4 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Details bottom sheet */}
      <BottomSheet
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        {...(selected
          ? { title: selected.label, subtitle: formatArea(selected) }
          : {})}
      >
        {selected && (
          <div className="pb-4">
            <div className="mb-5 flex items-end justify-between rounded-card bg-accent-soft px-4 py-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent-dark uppercase">
                  Price
                </p>
                <p className="font-display text-xl font-bold text-slate-900">
                  {formatPrice(selected.price)}
                </p>
              </div>
              <span
                className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${
                  selected.availableCount > 0
                    ? "bg-success text-white"
                    : "bg-danger text-white"
                }`}
              >
                {selected.availableCount > 0
                  ? `${selected.availableCount} available`
                  : "Sold out"}
              </span>
            </div>

            {selected.floorPlanImageUrl && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Floor plan
                </p>
                <img
                  src={selected.floorPlanImageUrl}
                  alt={`${selected.label} floor plan`}
                  className="w-full rounded-image border border-slate-200 object-cover"
                />
              </div>
            )}

            <div className="mb-5 grid grid-cols-2 gap-2">
              {baseDetails(selected).map((d) => (
                <div key={d.key} className="rounded-input bg-slate-50 px-3 py-2.5">
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                    {d.key}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {d.value}
                  </p>
                </div>
              ))}
            </div>

            {selected.attributes && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Full specifications
                </p>
                <AttributesList attributes={selected.attributes} />
              </div>
            )}

            <InterestForm
              projectId={projectId}
              unitTypes={[
                { id: selected.id, label: selected.label, price: selected.price },
              ]}
              builderName={builderName}
              onSubmitted={() => setSelectedId(null)}
            />
          </div>
        )}
      </BottomSheet>
    </>
  );
}
