"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  searchProjectsClient as searchProjects,
  getCitiesClient as getCities,
  getLocalitiesClient as getLocalities,
  getAmenitiesClient as getAmenities,
  getBuildersClient as getBuilders,
} from "../../lib/api";
import type { ProjectSearchParams, ProjectSort } from "../../lib/api/publicProjects";
import { expandBedroomValues } from "../../lib/filters";
import { useDebounce } from "../../lib/hooks";
import { ProjectCard } from "../../components/project-card";
import { HorizontalProjectCard } from "../../components/horizontal-project-card";
import { HeroSearchCard } from "../../components/hero-search-card";
import { ListGridSkeleton } from "../../components/skeleton";
import { FilterPanel, type FilterState, PROPERTY_TYPES, POSSESSION_OPTIONS, FACING_OPTIONS, LAND_TITLE_OPTIONS, RERA_STATUS_OPTIONS } from "../../components/filter-panel";
import { FilterSheet } from "../../components/filter-sheet";
import type { PublicProjectSummary } from "../../types/public";
import {
  ArrowRight,
  Grid,
  List,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function formatBudgetChip(min: string, max: string): string | null {
  const minL = Number(min);
  const maxL = Number(max);
  if (minL <= 0 && maxL >= 500) return null;
  const fmt = (v: number) => (v >= 100 ? `₹${v / 100}Cr` : `₹${v}L`);
  if (minL > 0 && maxL < 500) return `${fmt(minL)} – ${fmt(maxL)}`;
  if (minL > 0) return `${fmt(minL)}+`;
  if (maxL < 500) return `Under ${fmt(maxL)}`;
  return null;
}

function formatAreaChip(min: string, max: string): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min}–${max} sqft`;
  if (min) return `${min}+ sqft`;
  if (max) return `Up to ${max} sqft`;
  return null;
}

// ── DEFAULT STATE ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: FilterState = {
  selectedCity: "",
  selectedLocalities: [],
  selectedPropertyTypes: [],
  selectedBedrooms: [],
  selectedPossession: [],
  selectedAmenities: [],
  selectedBuilder: "",
  selectedFacing: [],
  landTitleType: "",
  reraStatus: "",
  hasGatedEntry: false,
  hasCctv: false,
  fireSafetyCompliant: false,
  availableOnly: false,
  showReraOnly: false,
  budgetMin: "0",
  budgetMax: "500",
  areaMin: "",
  areaMax: "",
  builtUpMin: "",
  builtUpMax: "",
};

// ── Page content ──────────────────────────────────────────────────────────────

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ---- Read URL params ----
  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") || "newest") as ProjectSort;

  // ---- Local filter state ----
  const [filterState, setFilterState] = useState<FilterState>(() => ({
    selectedCity: searchParams.get("city") ?? "",
    selectedLocalities: searchParams.get("localityId")
      ? [searchParams.get("localityId")!]
      : [],
    selectedPropertyTypes: splitCsv(searchParams.get("propertyType")),
    selectedBedrooms: splitCsv(searchParams.get("bedrooms")),
    selectedPossession: splitCsv(searchParams.get("possessionStatus")),
    selectedAmenities: splitCsv(searchParams.get("amenities")),
    selectedBuilder: searchParams.get("builder") ?? "",
    selectedFacing: splitCsv(searchParams.get("facing")),
    landTitleType: searchParams.get("landTitleType") ?? "",
    reraStatus: searchParams.get("reraStatus") ?? "",
    hasGatedEntry: searchParams.get("hasGatedEntry") === "true",
    hasCctv: searchParams.get("hasCctv") === "true",
    fireSafetyCompliant: searchParams.get("fireSafetyCompliant") === "true",
    availableOnly: searchParams.get("availableOnly") === "true",
    showReraOnly: searchParams.get("verifiedOnly") === "true",
    budgetMin: searchParams.get("minPrice")
      ? String(Number(searchParams.get("minPrice")) / 100000)
      : "0",
    budgetMax: searchParams.get("maxPrice")
      ? String(Number(searchParams.get("maxPrice")) / 100000)
      : "500",
    areaMin: searchParams.get("minArea") ?? "",
    areaMax: searchParams.get("maxArea") ?? "",
    builtUpMin: searchParams.get("minBuiltUp") ?? "",
    builtUpMax: searchParams.get("maxBuiltUp") ?? "",
  }));

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Sync filter state when URL changes (browser back/forward, chip removal)
  useEffect(() => {
    setFilterState({
      selectedCity: searchParams.get("city") ?? "",
      selectedLocalities: searchParams.get("localityId")
        ? [searchParams.get("localityId")!]
        : [],
      selectedPropertyTypes: splitCsv(searchParams.get("propertyType")),
      selectedBedrooms: splitCsv(searchParams.get("bedrooms")),
      selectedPossession: splitCsv(searchParams.get("possessionStatus")),
      selectedAmenities: splitCsv(searchParams.get("amenities")),
      selectedBuilder: searchParams.get("builder") ?? "",
      selectedFacing: splitCsv(searchParams.get("facing")),
      landTitleType: searchParams.get("landTitleType") ?? "",
      reraStatus: searchParams.get("reraStatus") ?? "",
      hasGatedEntry: searchParams.get("hasGatedEntry") === "true",
      hasCctv: searchParams.get("hasCctv") === "true",
      fireSafetyCompliant: searchParams.get("fireSafetyCompliant") === "true",
      availableOnly: searchParams.get("availableOnly") === "true",
      showReraOnly: searchParams.get("verifiedOnly") === "true",
      budgetMin: searchParams.get("minPrice")
        ? String(Number(searchParams.get("minPrice")) / 100000)
        : "0",
      budgetMax: searchParams.get("maxPrice")
        ? String(Number(searchParams.get("maxPrice")) / 100000)
        : "500",
      areaMin: searchParams.get("minArea") ?? "",
      areaMax: searchParams.get("maxArea") ?? "",
      builtUpMin: searchParams.get("minBuiltUp") ?? "",
      builtUpMax: searchParams.get("maxBuiltUp") ?? "",
    });
  }, [searchParams]);

  // ---- Data queries ----
  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: Infinity,
  });

  const cityObj = citiesData?.find((c) => c.slug === filterState.selectedCity);

  const { data: localitiesData } = useQuery({
    queryKey: ["localities", cityObj?.id],
    queryFn: () => getLocalities(cityObj!.id),
    enabled: Boolean(cityObj?.id),
    staleTime: Infinity,
  });

  const { data: amenitiesData } = useQuery({
    queryKey: ["amenities"],
    queryFn: getAmenities,
    staleTime: Infinity,
  });

  const { data: buildersData } = useQuery({
    queryKey: ["builders"],
    queryFn: getBuilders,
    staleTime: Infinity,
  });

  // ---- Build API params from filter state ----
  const apiParams = useMemo<ProjectSearchParams>(() => {
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
    } = filterState;

    const p: ProjectSearchParams = { limit: 10 };
    if (q) p.q = q;
    if (selectedCity) p.city = selectedCity;
    const locId = selectedLocalities[0];
    if (locId) p.localityId = locId;
    if (selectedPropertyTypes.length) p.propertyType = selectedPropertyTypes.join(",");
    if (selectedBedrooms.length) p.bedrooms = expandBedroomValues(selectedBedrooms).join(",");
    if (Number(budgetMin) > 0) p.minPrice = Number(budgetMin) * 100000;
    if (Number(budgetMax) < 500) p.maxPrice = Number(budgetMax) * 100000;
    if (areaMin) p.minArea = Number(areaMin);
    if (areaMax) p.maxArea = Number(areaMax);
    if (builtUpMin) p.minBuiltUp = Number(builtUpMin);
    if (builtUpMax) p.maxBuiltUp = Number(builtUpMax);
    if (selectedPossession.length) p.possessionStatus = selectedPossession.join(",");
    if (selectedAmenities.length) p.amenities = selectedAmenities;
    if (selectedBuilder) p.builder = selectedBuilder;
    if (selectedFacing.length) p.facing = selectedFacing.join(",");
    if (hasGatedEntry) p.hasGatedEntry = true;
    if (hasCctv) p.hasCctv = true;
    if (fireSafetyCompliant) p.fireSafetyCompliant = true;
    if (availableOnly) p.availableOnly = true;
    if (landTitleType) p.landTitleType = landTitleType;
    if (reraStatus) p.reraStatus = reraStatus;
    if (showReraOnly) p.verifiedOnly = true;
    if (sort !== "newest") p.sort = sort;
    return p;
  }, [filterState, q, sort]);

  // Free-text range inputs (budget/area/built-up) would otherwise fire one
  // request per keystroke since `apiParams` is derived straight from live
  // `filterState`. Debouncing only the value fed to the query — not
  // `filterState` itself — keeps the inputs/chips feeling instant while
  // collapsing rapid edits into a single request once typing settles.
  const debouncedApiParams = useDebounce(apiParams, 400);

  // ---- Infinite query ----
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["projects", debouncedApiParams],
    queryFn: ({ pageParam }) => searchProjects({ ...debouncedApiParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page * last.meta.limit < last.meta.total
        ? last.meta.page + 1
        : undefined,
  });

  const cityName = filterState.selectedCity
    ? cityObj?.name ??
      filterState.selectedCity.charAt(0).toUpperCase() +
        filterState.selectedCity.slice(1)
    : "All cities";

  // ---- URL builder ----
  function buildUrl(s: FilterState, currentQ: string, currentSort: string): string {
    const sp = new URLSearchParams();
    if (currentQ) sp.set("q", currentQ);
    if (s.selectedCity) sp.set("city", s.selectedCity);
    const locId = s.selectedLocalities[0];
    if (locId) sp.set("localityId", locId);
    if (s.selectedPropertyTypes.length) sp.set("propertyType", s.selectedPropertyTypes.join(","));
    if (s.selectedBedrooms.length) sp.set("bedrooms", s.selectedBedrooms.join(","));
    if (Number(s.budgetMin) > 0) sp.set("minPrice", String(Number(s.budgetMin) * 100000));
    if (Number(s.budgetMax) < 500) sp.set("maxPrice", String(Number(s.budgetMax) * 100000));
    if (s.areaMin) sp.set("minArea", s.areaMin);
    if (s.areaMax) sp.set("maxArea", s.areaMax);
    if (s.builtUpMin) sp.set("minBuiltUp", s.builtUpMin);
    if (s.builtUpMax) sp.set("maxBuiltUp", s.builtUpMax);
    if (s.selectedPossession.length) sp.set("possessionStatus", s.selectedPossession.join(","));
    if (s.selectedAmenities.length) sp.set("amenities", s.selectedAmenities.join(","));
    if (s.selectedBuilder) sp.set("builder", s.selectedBuilder);
    if (s.selectedFacing.length) sp.set("facing", s.selectedFacing.join(","));
    if (s.hasGatedEntry) sp.set("hasGatedEntry", "true");
    if (s.hasCctv) sp.set("hasCctv", "true");
    if (s.fireSafetyCompliant) sp.set("fireSafetyCompliant", "true");
    if (s.availableOnly) sp.set("availableOnly", "true");
    if (s.landTitleType) sp.set("landTitleType", s.landTitleType);
    if (s.reraStatus) sp.set("reraStatus", s.reraStatus);
    if (s.showReraOnly) sp.set("verifiedOnly", "true");
    if (currentSort !== "newest") sp.set("sort", currentSort);
    const qs = sp.toString();
    return qs ? `/search?${qs}` : "/search";
  }

  function applyFilters() {
    router.push(buildUrl(filterState, q, sort));
  }

  // ---- Merge a HeroSearchCard submission into the existing filters ----
  // The hero card only ever controls city/query/propertyType/budget/bhk/
  // possession/reraOnly. Submitting it used to `router.push` a brand new
  // query string built from just those fields, silently dropping every
  // sidebar-only filter (amenities, facing, land title, area range,
  // gated/CCTV/fire-safety/available toggles) that was already active.
  // City and the search box are always-visible/primary, so they fully
  // follow the hero card's current value (including being cleared). The
  // quick-filter dropdowns reset to blank on every mount, so they only
  // override the existing filter when the user actually picks something —
  // an absent key here means "untouched", not "clear this filter".
  function applyHeroSearch(heroParams: URLSearchParams) {
    const nextCity = heroParams.get("city") ?? "";
    const nextQ = heroParams.get("q") ?? "";
    const next: FilterState = {
      ...filterState,
      selectedCity: nextCity,
      selectedLocalities:
        nextCity !== filterState.selectedCity ? [] : filterState.selectedLocalities,
    };
    if (heroParams.has("propertyType")) {
      next.selectedPropertyTypes = splitCsv(heroParams.get("propertyType"));
    }
    if (heroParams.has("maxPrice")) {
      next.budgetMin = "0";
      next.budgetMax = String(Number(heroParams.get("maxPrice")) / 100000);
    }
    if (heroParams.has("bedrooms")) {
      next.selectedBedrooms = splitCsv(heroParams.get("bedrooms"));
    }
    if (heroParams.has("possessionStatus")) {
      next.selectedPossession = splitCsv(heroParams.get("possessionStatus"));
    }
    if (heroParams.has("verifiedOnly")) {
      next.showReraOnly = heroParams.get("verifiedOnly") === "true";
    }
    setFilterState(next);
    router.push(buildUrl(next, nextQ, sort));
  }

  function clearAllFilters() {
    setFilterState(DEFAULT_STATE);
    router.push("/search");
  }

  // ---- Remove single active chip ----
  function removeFilter(key: string, value?: string) {
    const next = { ...filterState };
    switch (key) {
      case "q": {
        const sp = new URLSearchParams(searchParams.toString());
        sp.delete("q");
        router.push(sp.toString() ? `/search?${sp.toString()}` : "/search");
        return;
      }
      case "city":
        next.selectedCity = "";
        next.selectedLocalities = [];
        break;
      case "localityId":
        next.selectedLocalities = [];
        break;
      case "propertyType":
        next.selectedPropertyTypes = next.selectedPropertyTypes.filter((t) => t !== value);
        break;
      case "bedrooms":
        next.selectedBedrooms = [];
        break;
      case "budget":
        next.budgetMin = "0";
        next.budgetMax = "500";
        break;
      case "area":
        next.areaMin = "";
        next.areaMax = "";
        break;
      case "builtUpArea":
        next.builtUpMin = "";
        next.builtUpMax = "";
        break;
      case "possessionStatus":
        next.selectedPossession = next.selectedPossession.filter((p) => p !== value);
        break;
      case "amenity":
        next.selectedAmenities = next.selectedAmenities.filter((a) => a !== value);
        break;
      case "builder":
        next.selectedBuilder = "";
        break;
      case "facing":
        next.selectedFacing = next.selectedFacing.filter((f) => f !== value);
        break;
      case "hasGatedEntry":
        next.hasGatedEntry = false;
        break;
      case "hasCctv":
        next.hasCctv = false;
        break;
      case "fireSafetyCompliant":
        next.fireSafetyCompliant = false;
        break;
      case "availableOnly":
        next.availableOnly = false;
        break;
      case "landTitleType":
        next.landTitleType = "";
        break;
      case "reraStatus":
        next.reraStatus = "";
        break;
      case "verifiedOnly":
        next.showReraOnly = false;
        break;
    }
    setFilterState(next);
    router.push(buildUrl(next, q, sort));
  }

  // ---- Active chips ----
  const activeChips = useMemo(() => {
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
    } = filterState;

    const chips: { key: string; label: string; value?: string }[] = [];
    if (q) chips.push({ key: "q", label: `"${q}"` });
    if (selectedCity) chips.push({ key: "city", label: cityName });
    if (selectedLocalities.length) {
      const loc = localitiesData?.find((l) => l.id === selectedLocalities[0]);
      chips.push({ key: "localityId", label: loc?.name ?? "Locality" });
    }
    selectedPropertyTypes.forEach((pt) => {
      const label = PROPERTY_TYPES.find((p) => p.val === pt)?.type ?? pt;
      chips.push({ key: "propertyType", label, value: pt });
    });
    if (selectedBedrooms.length) {
      chips.push({ key: "bedrooms", label: `${selectedBedrooms.join(", ")} BHK` });
    }
    const budgetLabel = formatBudgetChip(budgetMin, budgetMax);
    if (budgetLabel) chips.push({ key: "budget", label: budgetLabel });
    const areaLabel = formatAreaChip(areaMin, areaMax);
    if (areaLabel) chips.push({ key: "area", label: areaLabel });
    const builtUpLabel = formatAreaChip(builtUpMin, builtUpMax);
    if (builtUpLabel) chips.push({ key: "builtUpArea", label: `${builtUpLabel} built-up` });
    selectedPossession.forEach((p) => {
      const label = POSSESSION_OPTIONS.find((o) => o.val === p)?.label ?? p;
      chips.push({ key: "possessionStatus", label, value: p });
    });
    selectedAmenities.forEach((id) => {
      const am = amenitiesData?.find((a) => String(a.id) === id);
      chips.push({ key: "amenity", label: am?.name ?? `Amenity #${id}`, value: id });
    });
    if (selectedBuilder) {
      const b = buildersData?.find((b) => b.slug === selectedBuilder);
      chips.push({ key: "builder", label: b?.companyName ?? selectedBuilder });
    }
    selectedFacing.forEach((f) => {
      const label = FACING_OPTIONS.find((o) => o.val === f)?.label ?? f;
      chips.push({ key: "facing", label, value: f });
    });
    if (hasGatedEntry) chips.push({ key: "hasGatedEntry", label: "Gated Community" });
    if (hasCctv) chips.push({ key: "hasCctv", label: "CCTV" });
    if (fireSafetyCompliant) chips.push({ key: "fireSafetyCompliant", label: "Fire Safety" });
    if (availableOnly) chips.push({ key: "availableOnly", label: "Available Units" });
    if (landTitleType) {
      const label = LAND_TITLE_OPTIONS.find((o) => o.val === landTitleType)?.label ?? landTitleType;
      chips.push({ key: "landTitleType", label: `Title: ${label}` });
    }
    if (reraStatus) {
      const label = RERA_STATUS_OPTIONS.find((o) => o.val === reraStatus)?.label ?? reraStatus;
      chips.push({ key: "reraStatus", label: `RERA: ${label}` });
    }
    if (showReraOnly) chips.push({ key: "verifiedOnly", label: "RERA Verified" });
    return chips;
  }, [filterState, q, cityName, localitiesData, amenitiesData, buildersData]);

  const projects: PublicProjectSummary[] = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;
  const limit = data?.pages[0]?.meta.limit ?? 10;
  const currentPage = data?.pages.length ?? 1;
  const showingTo = Math.min(currentPage * limit, total);

  const panelProps = {
    state: filterState,
    cities: citiesData ?? [],
    localities: localitiesData ?? [],
    amenities: amenitiesData ?? [],
    builders: buildersData ?? [],
    onChange: (next: Partial<FilterState>) =>
      setFilterState((prev) => ({ ...prev, ...next })),
    onApply: applyFilters,
    onClearAll: clearAllFilters,
    resultCount: total,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* ── Top Hero Banner ── */}
      <section className="relative overflow-hidden bg-ink-blue px-6 py-10 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-blue/80 via-ink-blue/70 to-ink-blue/90" />
        <div className="relative mx-auto max-w-7xl">
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Find Your Perfect Property
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Verified projects. No brokers. Just better choices.
          </p>
          <div className="mt-6">
            <HeroSearchCard
              cities={citiesData ?? []}
              showQuickFilters
              compact
              initialCity={filterState.selectedCity}
              initialQuery={q}
              onMoreFiltersClick={() => setFilterSheetOpen(true)}
              onSearch={applyHeroSearch}
            />
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* ── Desktop Sidebar ── */}
          <aside
            id="filter-sidebar"
            className="hidden w-72 shrink-0 lg:block"
          >
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <FilterPanel {...panelProps} />
            </div>
          </aside>

          {/* ── Results Column ── */}
          <main className="min-w-0 flex-1">

            {/* ── Toolbar row ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  id="mobile-filter-btn"
                  onClick={() => setFilterSheetOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm lg:hidden"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeChips.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink-blue text-[10px] font-bold text-white">
                      {activeChips.length}
                    </span>
                  )}
                </button>
                <h2 className="text-lg font-bold text-slate-900">
                  <span className="text-accent">{total}</span> properties
                  {filterState.selectedCity ? ` in ${cityName}` : ""}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="hidden sm:inline">Sort by:</span>
                  <select
                    id="search-sort"
                    value={sort}
                    onChange={(e) => {
                      const sp = new URLSearchParams(searchParams.toString());
                      sp.set("sort", e.target.value);
                      router.push(`/search?${sp.toString()}`);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    id="view-mode-grid"
                    className={`rounded p-1.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400"}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    id="view-mode-list"
                    className={`rounded p-1.5 ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Active Filter Chips ── */}
            {activeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <span
                    key={`${chip.key}-${chip.value ?? chip.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-ink-blue"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={() => removeFilter(chip.key, chip.value)}
                      aria-label={`Remove ${chip.label} filter`}
                      className="ml-0.5 rounded-full hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ── Results ── */}
            <div className="mt-6">
              {isLoading && <ListGridSkeleton count={6} />}

              {!isLoading && projects.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <SearchX size={32} aria-hidden />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold text-slate-900">
                    No properties found
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                    {activeChips.length > 0
                      ? "We couldn't find any properties matching your current filters."
                      : "There are no properties listed yet. New verified projects from trusted builders are added regularly — check back soon."}
                  </p>
                  {activeChips.length > 0 && (
                    <ul className="mt-4 space-y-1 text-xs text-slate-500">
                      <li>Try removing one or two filters</li>
                      <li>Try a different city or locality</li>
                      <li>Widen your budget range</li>
                    </ul>
                  )}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {activeChips.length > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-accent-dark"
                      >
                        Clear All Filters
                      </button>
                    )}
                    <Link
                      href="/cities"
                      className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Explore by City
                    </Link>
                  </div>
                </div>
              )}

              {!isLoading && projects.length > 0 && (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2"
                      : "space-y-4"
                  }
                >
                  {projects.map((project) =>
                    viewMode === "grid" ? (
                      <ProjectCard key={project.slug} project={project} />
                    ) : (
                      <HorizontalProjectCard key={project.slug} project={project} />
                    )
                  )}
                </div>
              )}
            </div>

            {/* ── Pagination ── */}
            {projects.length > 0 && (
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
                {hasNextPage ? (
                  <button
                    id="load-more-btn"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Loading…" : "Load More Properties"}
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">All results loaded</p>
                )}
                <p className="text-xs text-slate-500">
                  Showing 1–{showingTo} of {total} properties
                </p>
              </div>
            )}

            {/* ── CTA Banner ── */}
            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink-blue p-6 text-white md:flex-row md:items-center">
              <div>
                <p className="text-base font-bold">
                  Can&apos;t find what you&apos;re looking for?
                </p>
                <p className="mt-0.5 text-xs text-white/70">
                  Get personalized property recommendations from verified builders.
                </p>
              </div>
              <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-accent-dark">
                Get Property Alerts <ArrowRight size={14} />
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Sheet ── */}
      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        {...panelProps}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ListGridSkeleton count={6} />}>
      <SearchPageContent />
    </Suspense>
  );
}
