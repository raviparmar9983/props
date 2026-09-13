"use client";

import type { City, Locality, Amenity, PublicBuilder } from "../types/public";
import { SlidersHorizontal } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

export const PROPERTY_TYPES = [
  { type: "Flat", val: "FLAT" },
  { type: "House", val: "HOUSE" },
  { type: "Plot", val: "PLOT" },
  { type: "Commercial", val: "CORPORATE" },
  { type: "Shop", val: "SHOP" },
  { type: "Tenement", val: "TENEMENT" },
];

export const POSSESSION_OPTIONS = [
  { label: "Ready to Move", val: "READY" },
  { label: "Under Construction", val: "UNDER_CONSTRUCTION" },
  { label: "New Launch", val: "UPCOMING" },
];

export const FACING_OPTIONS = [
  { label: "North", val: "NORTH" },
  { label: "South", val: "SOUTH" },
  { label: "East", val: "EAST" },
  { label: "West", val: "WEST" },
  { label: "N-East", val: "NORTH_EAST" },
  { label: "N-West", val: "NORTH_WEST" },
  { label: "S-East", val: "SOUTH_EAST" },
  { label: "S-West", val: "SOUTH_WEST" },
];

export const LAND_TITLE_OPTIONS = [
  { label: "Any", val: "" },
  { label: "Freehold", val: "FREEHOLD" },
  { label: "Leasehold", val: "LEASEHOLD" },
];

export const RERA_STATUS_OPTIONS = [
  { label: "Any", val: "" },
  { label: "Active", val: "ACTIVE" },
  { label: "Expired", val: "EXPIRED" },
  { label: "Not Required", val: "NOT_REQUIRED" },
];

// ── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  selectedCity: string;
  selectedLocalities: string[];
  selectedPropertyTypes: string[];
  selectedBedrooms: string[];
  selectedPossession: string[];
  selectedAmenities: string[];
  selectedBuilder: string;
  selectedFacing: string[];
  landTitleType: string;
  reraStatus: string;
  hasGatedEntry: boolean;
  hasCctv: boolean;
  fireSafetyCompliant: boolean;
  availableOnly: boolean;
  showReraOnly: boolean;
  budgetMin: string;
  budgetMax: string;
  areaMin: string;
  areaMax: string;
  builtUpMin: string;
  builtUpMax: string;
}

export interface FilterPanelProps {
  state: FilterState;
  cities: City[];
  localities: Locality[];
  amenities: Amenity[];
  builders: PublicBuilder[];
  onChange: (next: Partial<FilterState>) => void;
  onApply: () => void;
  onClearAll: () => void;
  resultCount?: number;
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {title}
      </label>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

// ── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1 hover:bg-slate-50"
    >
      <span className="text-xs text-slate-700">{label}</span>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink-blue ${
          checked ? "bg-ink-blue" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function FilterPanel({
  state,
  cities,
  localities,
  amenities,
  builders,
  onChange,
  onApply,
  onClearAll,
  resultCount,
}: FilterPanelProps) {
  const {
    selectedCity,
    selectedLocalities,
    selectedPropertyTypes,
    selectedBedrooms,
    selectedPossession,
    selectedAmenities,
    selectedBuilder,
    selectedFacing,
    landTitleType,
    reraStatus,
    hasGatedEntry,
    hasCctv,
    fireSafetyCompliant,
    availableOnly,
    showReraOnly,
    budgetMin,
    budgetMax,
    areaMin,
    areaMax,
    builtUpMin,
    builtUpMax,
  } = state;

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Filters</h2>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-accent hover:underline"
          id="filter-panel-clear-all"
        >
          Clear All
        </button>
      </div>

      {/* ── City ── */}
      <Section title="City">
        <select
          id="filter-city"
          value={selectedCity}
          onChange={(e) =>
            onChange({ selectedCity: e.target.value, selectedLocalities: [] })
          }
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40 focus:ring-1 focus:ring-ink-blue/20"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </Section>

      {/* ── Locality ── */}
      <Section title="Locality">
        <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1 text-xs text-slate-600">
          {localities.length === 0 ? (
            <p className="text-[11px] text-slate-400">
              Select a city to see localities
            </p>
          ) : (
            localities.slice(0, 12).map((loc) => (
              <label
                key={loc.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedLocalities.includes(loc.id)}
                  onChange={() =>
                    onChange({
                      selectedLocalities: selectedLocalities.includes(loc.id)
                        ? []
                        : [loc.id],
                    })
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-ink-blue focus:ring-ink-blue"
                />
                <span>{loc.name}</span>
              </label>
            ))
          )}
        </div>
      </Section>

      {/* ── Property Type ── */}
      <Section title="Property Type">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-600">
          {PROPERTY_TYPES.map((pt) => (
            <label
              key={pt.val}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                id={`filter-pt-${pt.val}`}
                checked={selectedPropertyTypes.includes(pt.val)}
                onChange={() =>
                  onChange({
                    selectedPropertyTypes: toggleArr(
                      selectedPropertyTypes,
                      pt.val
                    ),
                  })
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-ink-blue focus:ring-ink-blue"
              />
              <span>{pt.type}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── BHK ── */}
      <Section title="Bedrooms (BHK)">
        <div className="flex items-center gap-2">
          {["1", "2", "3", "4+"].map((bhk) => (
            <button
              key={bhk}
              type="button"
              id={`filter-bhk-${bhk}`}
              onClick={() =>
                onChange({ selectedBedrooms: toggleArr(selectedBedrooms, bhk) })
              }
              className={`flex-1 rounded-lg border py-2 text-center text-xs font-bold transition-colors ${
                selectedBedrooms.includes(bhk)
                  ? "border-ink-blue bg-ink-blue text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {bhk}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Budget ── */}
      <Section title="Budget (₹ Lakhs)">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <input
              id="filter-budget-min"
              type="number"
              min="0"
              placeholder="Min"
              value={budgetMin === "0" ? "" : budgetMin}
              onChange={(e) => onChange({ budgetMin: e.target.value || "0" })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
            />
            <p className="mt-0.5 text-center text-[10px] text-slate-400">
              Min (L)
            </p>
          </div>
          <span className="pb-4 text-slate-400">—</span>
          <div className="flex-1">
            <input
              id="filter-budget-max"
              type="number"
              min="0"
              placeholder="Max"
              value={budgetMax === "500" ? "" : budgetMax}
              onChange={(e) => onChange({ budgetMax: e.target.value || "500" })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
            />
            <p className="mt-0.5 text-center text-[10px] text-slate-400">
              Max (L)
            </p>
          </div>
        </div>
      </Section>

      {/* ── Carpet Area ── */}
      <Section title="Carpet Area (sq.ft)">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <input
              id="filter-area-min"
              type="number"
              min="0"
              placeholder="Min"
              value={areaMin}
              onChange={(e) => onChange({ areaMin: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
            />
            <p className="mt-0.5 text-center text-[10px] text-slate-400">
              Min sqft
            </p>
          </div>
          <span className="pb-4 text-slate-400">—</span>
          <div className="flex-1">
            <input
              id="filter-area-max"
              type="number"
              min="0"
              placeholder="Max"
              value={areaMax}
              onChange={(e) => onChange({ areaMax: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
            />
            <p className="mt-0.5 text-center text-[10px] text-slate-400">
              Max sqft
            </p>
          </div>
        </div>
      </Section>

      {/* ── Built-up Area ── */}
      <Section title="Built-up Area (sq.ft)">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <input
              id="filter-builtup-min"
              type="number"
              min="0"
              placeholder="Min"
              value={builtUpMin}
              onChange={(e) => onChange({ builtUpMin: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
            />
            <p className="mt-0.5 text-center text-[10px] text-slate-400">
              Min sqft
            </p>
          </div>
          <span className="pb-4 text-slate-400">—</span>
          <div className="flex-1">
            <input
              id="filter-builtup-max"
              type="number"
              min="0"
              placeholder="Max"
              value={builtUpMax}
              onChange={(e) => onChange({ builtUpMax: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
            />
            <p className="mt-0.5 text-center text-[10px] text-slate-400">
              Max sqft
            </p>
          </div>
        </div>
      </Section>

      {/* ── Possession Status ── */}
      <Section title="Possession Status">
        <div className="space-y-1.5 text-xs text-slate-600">
          {POSSESSION_OPTIONS.map((pos) => (
            <label
              key={pos.val}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                id={`filter-possession-${pos.val}`}
                checked={selectedPossession.includes(pos.val)}
                onChange={() =>
                  onChange({
                    selectedPossession: toggleArr(selectedPossession, pos.val),
                  })
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-ink-blue focus:ring-ink-blue"
              />
              <span>{pos.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Amenities ── */}
      {amenities.length > 0 && (
        <Section title="Amenities">
          <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1 text-xs text-slate-600">
            {amenities.map((am) => (
              <label
                key={am.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  id={`filter-amenity-${am.id}`}
                  checked={selectedAmenities.includes(String(am.id))}
                  onChange={() =>
                    onChange({
                      selectedAmenities: toggleArr(
                        selectedAmenities,
                        String(am.id)
                      ),
                    })
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-ink-blue focus:ring-ink-blue"
                />
                <span>{am.name}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* ── Builder ── */}
      {builders.length > 0 && (
        <Section title="Builder">
          <select
            id="filter-builder"
            value={selectedBuilder}
            onChange={(e) => onChange({ selectedBuilder: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40 focus:ring-1 focus:ring-ink-blue/20"
          >
            <option value="">All builders</option>
            {builders.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.companyName}
              </option>
            ))}
          </select>
        </Section>
      )}

      {/* ── Facing ── */}
      <Section title="Unit Facing">
        <div className="grid grid-cols-4 gap-1.5">
          {FACING_OPTIONS.map((f) => (
            <button
              key={f.val}
              type="button"
              id={`filter-facing-${f.val}`}
              onClick={() =>
                onChange({ selectedFacing: toggleArr(selectedFacing, f.val) })
              }
              className={`rounded-lg border py-1.5 text-center text-[10px] font-semibold transition-colors ${
                selectedFacing.includes(f.val)
                  ? "border-ink-blue bg-ink-blue text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Security & Lifestyle ── */}
      <Section title="Security &amp; Lifestyle">
        <div className="space-y-1">
          <ToggleRow
            id="filter-gated-entry"
            label="Gated Community"
            checked={hasGatedEntry}
            onChange={(v) => onChange({ hasGatedEntry: v })}
          />
          <ToggleRow
            id="filter-cctv"
            label="CCTV Surveillance"
            checked={hasCctv}
            onChange={(v) => onChange({ hasCctv: v })}
          />
          <ToggleRow
            id="filter-fire-safety"
            label="Fire Safety Compliant"
            checked={fireSafetyCompliant}
            onChange={(v) => onChange({ fireSafetyCompliant: v })}
          />
          <ToggleRow
            id="filter-available-only"
            label="Available Units Only"
            checked={availableOnly}
            onChange={(v) => onChange({ availableOnly: v })}
          />
        </div>
      </Section>

      {/* ── Land Title ── */}
      <Section title="Land Title">
        <div className="flex gap-2">
          {LAND_TITLE_OPTIONS.map((opt) => (
            <button
              key={opt.val}
              type="button"
              id={`filter-land-title-${opt.val || "any"}`}
              onClick={() => onChange({ landTitleType: opt.val })}
              className={`flex-1 rounded-lg border py-2 text-center text-[10px] font-semibold transition-colors ${
                landTitleType === opt.val
                  ? "border-ink-blue bg-ink-blue text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── RERA Status ── */}
      <Section title="RERA Status">
        <select
          id="filter-rera-status"
          value={reraStatus}
          onChange={(e) => onChange({ reraStatus: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-ink-blue/40"
        >
          {RERA_STATUS_OPTIONS.map((o) => (
            <option key={o.val} value={o.val}>
              {o.label}
            </option>
          ))}
        </select>
      </Section>

      {/* ── RERA Verified Builder ── */}
      <Section title="Builder Trust">
        <ToggleRow
          id="filter-rera-verified"
          label="RERA Registered Builder Only"
          checked={showReraOnly}
          onChange={(v) => onChange({ showReraOnly: v })}
        />
      </Section>

      {/* Apply button */}
      <button
        id="filter-panel-apply"
        onClick={onApply}
        className="mt-6 w-full rounded-xl bg-ink-blue py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-ink-blue/90 active:scale-[0.98]"
      >
        {resultCount !== undefined
          ? `Show ${resultCount} Properties`
          : "Apply Filters"}
      </button>
    </div>
  );
}
