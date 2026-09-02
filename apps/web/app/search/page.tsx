"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  searchProjects,
  getCities,
  getAmenities,
  getBuilders,
  getLocalities,
} from "../../lib/api";
import type { ProjectSearchParams, ProjectSort } from "../../lib/api/publicProjects";
import { ProjectCard } from "../../components/project-card";
import { Chip, ChipRow } from "../../components/filter-chips";
import { BottomSheet } from "../../components/bottom-sheet";
import { CollapsingSearchBar } from "../../components/collapsing-search-bar";
import { ListGridSkeleton } from "../../components/skeleton";
import { AmenityIcon } from "../../components/amenity-icon";
import { toast } from "../../lib/toast";
import type { PublicProjectSummary } from "../../types/public";
import { fileUrl } from "../../lib/format";
import {
  Building2,
  Check,
  CircleCheck,
  ListFilter,
  LoaderCircle,
  SearchX,
  ShieldCheck,
  X,
} from "lucide-react";

const LAKH = 100000;

const PROPERTY_TYPES = [
  { value: "FLAT", label: "Flats" },
  { value: "HOUSE", label: "Houses" },
  { value: "PLOT", label: "Plots" },
  { value: "TENEMENT", label: "Tenements" },
  { value: "SHOP", label: "Shops" },
  { value: "CORPORATE", label: "Corporate" },
] as const;

const RESIDENTIAL_TYPES = ["FLAT", "TENEMENT"];

const BEDROOM_OPTIONS = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4+ BHK" },
] as const;

const POSSESSION_STATUSES = [
  { value: "READY", label: "Ready to move" },
  { value: "UNDER_CONSTRUCTION", label: "Under construction" },
  { value: "UPCOMING", label: "Upcoming" },
] as const;

const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const APPLY_SHEETS = new Set(["type", "price", "bedrooms", "amenities", "more"]);

type SheetKind =
  | "sort"
  | "city"
  | "locality"
  | "type"
  | "price"
  | "bedrooms"
  | "amenities"
  | "more"
  | null;

interface Draft {
  propertyType: string[];
  bedrooms: string[];
  amenities: string[];
  priceMinL: string;
  priceMaxL: string;
  areaMin: string;
  areaMax: string;
  possessionStatus: string[];
  builder: string;
}

const emptyDraft = (): Draft => ({
  propertyType: [],
  bedrooms: [],
  amenities: [],
  priceMinL: "",
  priceMaxL: "",
  areaMin: "",
  areaMax: "",
  possessionStatus: [],
  builder: "",
});

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(0, 9);
}

function formatPriceValue(n: number): string {
  if (n >= 100) {
    const cr = n / 100;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)}Cr`;
  }
  return `₹${n}L`;
}

function formatPriceLabel(min: string, max: string): string {
  const minL = min ? Math.round(Number(min) / LAKH) : 0;
  const maxL = max ? Math.round(Number(max) / LAKH) : 0;
  if (minL > 0 && maxL > 0) return `${formatPriceValue(minL)} – ${formatPriceValue(maxL)}`;
  if (minL > 0) return `${formatPriceValue(minL)}+`;
  if (maxL > 0) return `Under ${formatPriceValue(maxL)}`;
  return "Price";
}

function compactLabels(
  values: string[],
  options: readonly { value: string; label: string }[],
  fallback: string,
): string {
  if (values.length === 0) return fallback;
  const labels = values.map((v) => options.find((o) => o.value === v)?.label ?? v);
  if (values.length <= 2) return labels.join(" + ");
  return `${values.length} selected`;
}

function RangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onMin,
  onMax,
}: {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const minPct = Math.min(pct(valueMin), 100);
  const maxPct = Math.max(pct(valueMax), 0);
  const overlap = maxPct - minPct < 3;
  return (
    <>
      <style>{`
        .range-track input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2.25rem;
          margin: 0;
          background: transparent;
          pointer-events: none;
        }
        .range-track input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 9999px;
          background: var(--color-accent);
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgb(15 23 42 / 0.35);
          cursor: grab;
        }
        .range-track input[type="range"]::-moz-range-thumb {
          pointer-events: auto;
          width: 1.1rem;
          height: 1.1rem;
          border-radius: 9999px;
          background: var(--color-accent);
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgb(15 23 42 / 0.35);
          cursor: grab;
        }
      `}</style>
      <div className="relative h-9">
        <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-slate-200" />
        <div
          className="absolute top-2.5 h-1 rounded-full bg-accent"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <div className="range-track absolute inset-0">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valueMin}
            onChange={(e) => onMin(Math.min(Number(e.target.value), valueMax))}
            style={{ zIndex: overlap ? 20 : 10 }}
            aria-label="Minimum value"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valueMax}
            onChange={(e) => onMax(Math.max(Number(e.target.value), valueMin))}
            style={{ zIndex: overlap ? 10 : 20 }}
            aria-label="Maximum value"
          />
        </div>
      </div>
    </>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const localityId = searchParams.get("localityId") ?? "";
  const propertyType = useMemo(() => splitCsv(searchParams.get("propertyType")), [searchParams]);
  const bedrooms = useMemo(() => splitCsv(searchParams.get("bedrooms")), [searchParams]);
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const minArea = searchParams.get("minArea") ?? "";
  const maxArea = searchParams.get("maxArea") ?? "";
  const amenities = useMemo(() => splitCsv(searchParams.get("amenities")), [searchParams]);
  const builder = searchParams.get("builder") ?? "";
  const possessionStatus = useMemo(() => splitCsv(searchParams.get("possessionStatus")), [searchParams]);
  const verified = searchParams.get("verified") === "true";
  const featured = searchParams.get("featured") === "true";
  const sort = (searchParams.get("sort") || (featured ? "featured" : "") || "newest") as ProjectSort;

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);

  const apiParams = useMemo<ProjectSearchParams>(() => {
    const p: ProjectSearchParams = { limit: 24 };
    if (q) p.q = q;
    if (city) p.city = city;
    if (localityId) p.localityId = localityId;
    if (builder) p.builder = builder;
    if (propertyType.length) p.propertyType = propertyType.join(",");
    if (bedrooms.length) p.bedrooms = bedrooms.join(",");
    if (minPrice) p.minPrice = Number(minPrice);
    if (maxPrice) p.maxPrice = Number(maxPrice);
    if (minArea) p.minArea = Number(minArea);
    if (maxArea) p.maxArea = Number(maxArea);
    if (amenities.length) p.amenities = amenities;
    if (possessionStatus.length) p.possessionStatus = possessionStatus.join(",");
    if (verified) p.verifiedOnly = true;
    if (sort !== "newest") p.sort = sort;
    return p;
  }, [
    q, city, localityId, builder, propertyType, bedrooms,
    minPrice, maxPrice, minArea, maxArea, amenities, possessionStatus, verified, sort,
  ]);

  const {
    data, isLoading, isError, isFetching, isPlaceholderData,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["projects", apiParams],
    queryFn: ({ pageParam }) => searchProjects({ ...apiParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page * last.meta.limit < last.meta.total ? last.meta.page + 1 : undefined,
    placeholderData: (prev) => prev,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
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

  const cityObj = citiesData?.find((c) => c.slug === city);
  const { data: localitiesData } = useQuery({
    queryKey: ["localities", cityObj?.id],
    queryFn: () => getLocalities(cityObj!.id),
    enabled: Boolean(cityObj?.id),
    staleTime: Infinity,
  });

  function openSheet(kind: SheetKind) {
    if (!kind) {
      setSheet(null);
      return;
    }
    switch (kind) {
      case "type":
        setDraft((d) => ({ ...d, propertyType }));
        break;
      case "bedrooms":
        setDraft((d) => ({ ...d, bedrooms }));
        break;
      case "amenities":
        setDraft((d) => ({ ...d, amenities }));
        break;
      case "price":
        setDraft((d) => ({
          ...d,
          priceMinL: minPrice ? String(Math.round(Number(minPrice) / LAKH)) : "",
          priceMaxL: maxPrice ? String(Math.round(Number(maxPrice) / LAKH)) : "",
        }));
        break;
      case "more":
        setDraft((d) => ({
          ...d,
          possessionStatus,
          areaMin: minArea,
          areaMax: maxArea,
          builder,
        }));
        break;
    }
    setSheet(kind);
  }

  function toggleDraftList(
    key: "propertyType" | "bedrooms" | "amenities" | "possessionStatus",
    value: string,
  ) {
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));
  }

  function setListParam(sp: URLSearchParams, key: string, values: string[]) {
    if (values.length > 0) sp.set(key, values.join(","));
    else sp.delete(key);
  }

  const draftParams = useMemo<ProjectSearchParams>(() => {
    const p: ProjectSearchParams = { ...apiParams, page: 1, limit: 1 };
    switch (sheet) {
      case "type":
        if (draft.propertyType.length) p.propertyType = draft.propertyType.join(",");
        else delete p.propertyType;
        break;
      case "bedrooms":
        if (draft.bedrooms.length) p.bedrooms = draft.bedrooms.join(",");
        else delete p.bedrooms;
        break;
      case "amenities":
        if (draft.amenities.length) p.amenities = draft.amenities;
        else delete p.amenities;
        break;
      case "price": {
        const min = Number(draft.priceMinL) * LAKH;
        const max = Number(draft.priceMaxL) * LAKH;
        if (min > 0) p.minPrice = min;
        else delete p.minPrice;
        if (max > 0) p.maxPrice = max;
        else delete p.maxPrice;
        break;
      }
      case "more":
        if (draft.possessionStatus.length) p.possessionStatus = draft.possessionStatus.join(",");
        else delete p.possessionStatus;
        if (draft.areaMin) p.minArea = Number(draft.areaMin);
        else delete p.minArea;
        if (draft.areaMax) p.maxArea = Number(draft.areaMax);
        else delete p.maxArea;
        if (draft.builder) p.builder = draft.builder;
        else delete p.builder;
        break;
    }
    return p;
  }, [sheet, draft, apiParams]);

  useEffect(() => {
    if (!sheet || !APPLY_SHEETS.has(sheet)) return;
    setCounting(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await searchProjects(draftParams, { revalidate: 0, cache: "no-store" });
        setLiveCount(res.meta.total);
      } catch {
        setLiveCount(null);
      } finally {
        setCounting(false);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [sheet, draftParams]);

  function applyDraft() {
    const sp = new URLSearchParams(searchParams.toString());
    switch (sheet) {
      case "type": {
        const onlyNonResidential =
          draft.propertyType.length > 0 &&
          draft.propertyType.every((t) => !RESIDENTIAL_TYPES.includes(t));
        if (onlyNonResidential && bedrooms.length > 0) {
          toast.info(
            "Bedroom filters don't apply to these property types and were cleared",
            "Filter cleared",
          );
          sp.delete("bedrooms");
        }
        setListParam(sp, "propertyType", draft.propertyType);
        break;
      }
      case "bedrooms":
        setListParam(sp, "bedrooms", draft.bedrooms);
        break;
      case "amenities":
        setListParam(sp, "amenities", draft.amenities);
        break;
      case "price": {
        const min = Number(draft.priceMinL) * LAKH;
        const max = Number(draft.priceMaxL) * LAKH;
        if (min > 0) sp.set("minPrice", String(min));
        else sp.delete("minPrice");
        if (max > 0) sp.set("maxPrice", String(max));
        else sp.delete("maxPrice");
        break;
      }
      case "more": {
        setListParam(sp, "possessionStatus", draft.possessionStatus);
        if (draft.areaMin) sp.set("minArea", draft.areaMin);
        else sp.delete("minArea");
        if (draft.areaMax) sp.set("maxArea", draft.areaMax);
        else sp.delete("maxArea");
        if (draft.builder) sp.set("builder", draft.builder);
        else sp.delete("builder");
        break;
      }
    }
    router.push(`/search?${sp.toString()}`, { scroll: false });
    setSheet(null);
  }

  function clearDraft() {
    switch (sheet) {
      case "type":
        setDraft((d) => ({ ...d, propertyType: [] }));
        break;
      case "bedrooms":
        setDraft((d) => ({ ...d, bedrooms: [] }));
        break;
      case "amenities":
        setDraft((d) => ({ ...d, amenities: [] }));
        break;
      case "price":
        setDraft((d) => ({ ...d, priceMinL: "", priceMaxL: "" }));
        break;
      case "more":
        setDraft((d) => ({ ...d, possessionStatus: [], areaMin: "", areaMax: "", builder: "" }));
        break;
    }
  }

  function applySort(value: ProjectSort) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "newest") sp.delete("sort");
    else sp.set("sort", value);
    sp.delete("featured");
    router.push(`/search?${sp.toString()}`, { scroll: false });
    setSheet(null);
  }

  function applyCity(slug: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (slug) sp.set("city", slug);
    else sp.delete("city");
    sp.delete("localityId");
    router.push(`/search?${sp.toString()}`, { scroll: false });
    setSheet(null);
  }

  function applyLocality(id: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (id) sp.set("localityId", id);
    else sp.delete("localityId");
    router.push(`/search?${sp.toString()}`, { scroll: false });
    setSheet(null);
  }

  function toggleVerified() {
    const sp = new URLSearchParams(searchParams.toString());
    if (verified) sp.delete("verified");
    else sp.set("verified", "true");
    router.push(`/search?${sp.toString()}`, { scroll: false });
  }

  function clearAllFilters() {
    const sp = new URLSearchParams(searchParams.toString());
    for (const key of [
      "city", "localityId", "propertyType", "bedrooms", "minPrice", "maxPrice",
      "minArea", "maxArea", "amenities", "builder", "possessionStatus", "verified", "sort", "featured",
    ]) {
      sp.delete(key);
    }
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
  }

  const projects: PublicProjectSummary[] = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;
  const showSkeleton = isLoading || (isFetching && isPlaceholderData);
  const propertyTypeOnlyNonResidential =
    propertyType.length > 0 && propertyType.every((t) => !RESIDENTIAL_TYPES.includes(t));

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "Sort";
  const cityLabel = citiesData?.find((c) => c.slug === city)?.name ?? "";
  const localityLabel = localitiesData?.find((l) => l.id === localityId)?.name ?? "";
  const builderName = builder
    ? buildersData?.find((b) => b.slug === builder)?.companyName ?? builder
    : "";
  const typeLabel = compactLabels(propertyType, PROPERTY_TYPES, "Type");
  const bhkLabel = compactLabels(bedrooms, BEDROOM_OPTIONS, "BHK");
  const priceLabel = formatPriceLabel(minPrice, maxPrice);
  const amenityLabel =
    amenities.length === 0 ? "Amenities" : `${amenities.length} amenit${amenities.length === 1 ? "y" : "ies"}`;
  const moreCount = possessionStatus.length + (minArea || maxArea ? 1 : 0) + (builder ? 1 : 0);
  const hasFilters = Boolean(
    city || localityId || propertyType.length || bedrooms.length || minPrice || maxPrice ||
    minArea || maxArea || amenities.length || builder || possessionStatus.length ||
    verified || sort !== "newest",
  );

  const priceSliderMax = 600;
  const priceSliderMin = Math.min(Number(draft.priceMinL) || 0, priceSliderMax);
  const priceSliderMaxV = Math.max(Number(draft.priceMaxL) || priceSliderMax, priceSliderMin);
  const areaSliderMin = Math.min(Number(draft.areaMin) || 0, 5000);
  const areaSliderMaxV = Math.max(Number(draft.areaMax) || 5000, areaSliderMin);

  function ApplyFooter() {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={clearDraft}
          className="rounded-pill border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Clear
        </button>
        <button
          onClick={applyDraft}
          disabled={counting}
          className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-white shadow-accent-button transition-all duration-[150ms] ease-[var(--ease-spring)] hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
        >
          {counting && (
            <LoaderCircle size={16} strokeWidth={3} className="animate-spin-slow" aria-hidden />
          )}
          Show {liveCount === null ? "…" : `${liveCount}`} result{liveCount === 1 ? "" : "s"}
        </button>
      </div>
    );
  }

  const optionButtonClass = (active: boolean) =>
    `rounded-input border px-4 py-3 text-left text-sm font-medium transition-colors active:scale-[0.98] ${
      active
        ? "border-accent bg-accent-soft text-accent-dark"
        : "border-slate-200 bg-surface text-slate-700 hover:border-accent/40 hover:text-accent"
    }`;

  return (
    <div className="pb-24 md:pb-0">
      <CollapsingSearchBar
        cities={citiesData ?? []}
        location={cityLabel || city}
        initialQuery={q}
        compact
      />

      {/* Sticky filter bar — top value aligns with bottom of the search bar above */}
      <div className="sticky top-[48px] z-30 border-b border-slate-100 bg-paper/95 backdrop-blur-md md:top-[144px]">
        <div className="mx-auto max-w-6xl px-4">
          <ChipRow className="py-2">
            <Chip
              label={activeSortLabel}
              leading={<ListFilter size={14} aria-hidden />}
              active={sort !== "newest"}
              onClick={() => openSheet("sort")}
            />
            <Chip
              label="Verified"
              leading={
                verified ? (
                  <ShieldCheck size={14} aria-hidden />
                ) : (
                  <CircleCheck size={14} aria-hidden />
                )
              }
              active={verified}
              onClick={toggleVerified}
            />
            <Chip
              label={cityLabel || "City"}
              active={Boolean(city)}
              onClick={() => openSheet("city")}
            />
            <Chip
              label={localityLabel || "Locality"}
              active={Boolean(localityId)}
              disabled={!city}
              onClick={() => openSheet("locality")}
            />
            <Chip
              label={typeLabel}
              active={propertyType.length > 0}
              count={propertyType.length || undefined}
              onClick={() => openSheet("type")}
            />
            <Chip
              label={priceLabel}
              active={Boolean(minPrice || maxPrice)}
              onClick={() => openSheet("price")}
            />
            {!propertyTypeOnlyNonResidential && (
              <Chip
                label={bhkLabel}
                active={bedrooms.length > 0}
                count={bedrooms.length || undefined}
                onClick={() => openSheet("bedrooms")}
              />
            )}
            <Chip
              label={amenityLabel}
              active={amenities.length > 0}
              count={amenities.length || undefined}
              onClick={() => openSheet("amenities")}
            />
            <Chip
              label="More"
              active={moreCount > 0}
              count={moreCount || undefined}
              onClick={() => openSheet("more")}
            />
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex shrink-0 items-center gap-1 rounded-pill px-4 py-2 text-sm font-semibold whitespace-nowrap text-danger transition-colors hover:bg-danger-soft"
              >
                <X size={14} strokeWidth={3} aria-hidden />
                Clear all
              </button>
            )}
          </ChipRow>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
            {q
              ? `Results for "${q}"`
              : city
                ? `${cityLabel || city} projects`
                : "All projects"}
          </h1>
          {!showSkeleton && (
            <p className="text-sm text-slate-400">
              {total} result{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <p className="mt-3 text-xs font-medium text-success">
          <span className="mr-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rating-gold/20 text-rating-gold">
            <CircleCheck size={10} strokeWidth={3} aria-hidden />
          </span>
          Every listing is from a verified builder
        </p>

        {/* Results */}
        <div className="mt-5">
          {showSkeleton && <ListGridSkeleton count={6} />}

          {!showSkeleton && isError && (
            <div className="rounded-card border border-danger-soft bg-danger-soft p-6 text-sm text-danger">
              Something went wrong while searching. Please try again.
            </div>
          )}

          {!showSkeleton && !isError && projects.length === 0 && (
            <div className="rounded-card bg-surface p-12 text-center shadow-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <SearchX size={28} strokeWidth={2} aria-hidden />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-slate-900">
                No projects match
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
                Try adjusting or removing some of your filters.
              </p>
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-accent-button transition-colors hover:bg-accent-dark"
                >
                  <X size={14} strokeWidth={3} aria-hidden />
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!showSkeleton && !isError && projects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </div>
          )}

          {hasNextPage && !showSkeleton && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 rounded-pill border border-slate-200 bg-surface px-6 py-3 text-sm font-medium text-slate-700 transition-all duration-[150ms] ease-[var(--ease-spring)] hover:border-accent/40 active:scale-[0.97] disabled:opacity-60"
              >
                {isFetchingNextPage ? (
                  <>
                    <LoaderCircle
                      className="animate-spin-slow"
                      size={16}
                      strokeWidth={3}
                      aria-hidden
                    />
                    Loading…
                  </>
                ) : (
                  "Load more projects"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sort sheet */}
      <BottomSheet open={sheet === "sort"} onClose={() => setSheet(null)} title="Sort by">
        <div className="flex flex-col gap-1 pb-4">
          {SORT_OPTIONS.map((s) => {
            const active = sort === s.value;
            return (
              <button
                key={s.value}
                onClick={() => applySort(s.value)}
                className={`flex items-center justify-between rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-soft text-accent-dark"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {s.label}
                {active && (
                  <Check size={18} strokeWidth={2.5} className="text-accent" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* City sheet */}
      <BottomSheet open={sheet === "city"} onClose={() => setSheet(null)} title="City">
        <div className="flex flex-col gap-1 pb-4">
          <button
            onClick={() => applyCity("")}
            className={`flex items-center justify-between rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
              city === "" ? "bg-accent-soft text-accent-dark" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            All cities
            {city === "" && (
              <Check size={18} strokeWidth={2.5} className="text-accent" aria-hidden />
            )}
          </button>
          {(citiesData ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => applyCity(c.slug)}
              className={`flex items-center justify-between rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
                city === c.slug ? "bg-accent-soft text-accent-dark" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {c.name}
              {city === c.slug && (
                <Check size={18} strokeWidth={2.5} className="text-accent" aria-hidden />
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Locality sheet */}
      <BottomSheet
        open={sheet === "locality"}
        onClose={() => setSheet(null)}
        title="Locality"
        subtitle={city ? `Localities in ${cityLabel || city}` : "Pick a city first"}
      >
        {!city ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Select a city to browse localities.
          </p>
        ) : (
          <div className="flex flex-col gap-1 pb-4">
            <button
              onClick={() => applyLocality("")}
              className={`flex items-center justify-between rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
                localityId === ""
                  ? "bg-accent-soft text-accent-dark"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              All localities
              {localityId === "" && (
                <Check size={18} strokeWidth={2.5} className="text-accent" aria-hidden />
              )}
            </button>
            {(localitiesData ?? []).map((l) => (
              <button
                key={l.id}
                onClick={() => applyLocality(l.id)}
                className={`flex items-center justify-between rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
                  localityId === l.id
                    ? "bg-accent-soft text-accent-dark"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {l.name}
                {localityId === l.id && (
                  <Check size={18} strokeWidth={2.5} className="text-accent" aria-hidden />
                )}
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      {/* Property type sheet */}
      <BottomSheet
        open={sheet === "type"}
        onClose={() => setSheet(null)}
        title="Property type"
        subtitle="Select one or more"
        footer={<ApplyFooter />}
      >
        <div className="grid grid-cols-2 gap-2 pb-4">
          {PROPERTY_TYPES.map((t) => {
            const active = draft.propertyType.includes(t.value);
            return (
              <button
                key={t.value}
                onClick={() => toggleDraftList("propertyType", t.value)}
                aria-pressed={active}
                className={optionButtonClass(active)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Bedrooms sheet */}
      <BottomSheet
        open={sheet === "bedrooms"}
        onClose={() => setSheet(null)}
        title="Bedrooms"
        subtitle="Select one or more"
        footer={<ApplyFooter />}
      >
        <div className="grid grid-cols-2 gap-2 pb-4">
          {BEDROOM_OPTIONS.map((b) => {
            const active = draft.bedrooms.includes(b.value);
            return (
              <button
                key={b.value}
                onClick={() => toggleDraftList("bedrooms", b.value)}
                aria-pressed={active}
                className={optionButtonClass(active)}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Price sheet */}
      <BottomSheet
        open={sheet === "price"}
        onClose={() => setSheet(null)}
        title="Price range"
        subtitle="Budget in lakhs (₹)"
        footer={<ApplyFooter />}
      >
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Min price</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.priceMinL}
                onChange={(e) => setDraft((d) => ({ ...d, priceMinL: onlyDigits(e.target.value) }))}
                placeholder="e.g. 20"
                className="w-full rounded-input border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Max price</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.priceMaxL}
                onChange={(e) => setDraft((d) => ({ ...d, priceMaxL: onlyDigits(e.target.value) }))}
                placeholder="e.g. 80"
                className="w-full rounded-input border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </label>
          </div>
          <div className="mt-6 px-1">
            <RangeSlider
              min={0}
              max={priceSliderMax}
              step={5}
              valueMin={priceSliderMin}
              valueMax={priceSliderMaxV}
              onMin={(v) => setDraft((d) => ({ ...d, priceMinL: String(v) }))}
              onMax={(v) => setDraft((d) => ({ ...d, priceMaxL: String(v) }))}
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>₹0L</span>
              <span>₹{priceSliderMax}L</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Leave a field blank for "no limit" on that end.
          </p>
        </div>
      </BottomSheet>

      {/* Amenities sheet */}
      <BottomSheet
        open={sheet === "amenities"}
        onClose={() => setSheet(null)}
        title="Amenities"
        subtitle="Every selected amenity must be present"
        footer={<ApplyFooter />}
      >
        <div className="flex flex-wrap gap-2 pb-4">
          {(amenitiesData ?? []).map((a) => {
            const active = draft.amenities.includes(String(a.id));
            return (
              <button
                key={a.id}
                onClick={() => toggleDraftList("amenities", String(a.id))}
                aria-pressed={active}
                className={`rounded-pill border px-4 py-2 text-sm font-medium transition-all duration-[150ms] ease-[var(--ease-spring)] active:scale-[0.97] ${
                  active
                    ? "border-accent bg-accent text-white shadow-accent-button"
                    : "border-slate-200 bg-surface text-slate-600 hover:border-accent/40"
                }`}
              >
                <AmenityIcon icon={a.icon} size={14} className="mr-1.5" />
                {a.name}
              </button>
            );
          })}
          {(amenitiesData ?? []).length === 0 && (
            <p className="w-full py-8 text-center text-sm text-slate-400">No amenities available</p>
          )}
        </div>
      </BottomSheet>

      {/* More sheet */}
      <BottomSheet
        open={sheet === "more"}
        onClose={() => setSheet(null)}
        title="More filters"
        footer={<ApplyFooter />}
      >
        <div className="space-y-7 pb-4">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Possession status</h3>
            <div className="flex flex-wrap gap-2">
              {POSSESSION_STATUSES.map((s) => {
                const active = draft.possessionStatus.includes(s.value);
                return (
                  <button
                    key={s.value}
                    onClick={() => toggleDraftList("possessionStatus", s.value)}
                    aria-pressed={active}
                    className={optionButtonClass(active)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Carpet area</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Min (sqft)</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.areaMin}
                  onChange={(e) => setDraft((d) => ({ ...d, areaMin: onlyDigits(e.target.value) }))}
                  placeholder="e.g. 1000"
                  className="w-full rounded-input border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Max (sqft)</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.areaMax}
                  onChange={(e) => setDraft((d) => ({ ...d, areaMax: onlyDigits(e.target.value) }))}
                  placeholder="e.g. 2000"
                  className="w-full rounded-input border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
              </label>
            </div>
            <div className="mt-6 px-1">
              <RangeSlider
                min={0}
                max={5000}
                step={50}
                valueMin={areaSliderMin}
                valueMax={areaSliderMaxV}
                onMin={(v) => setDraft((d) => ({ ...d, areaMin: String(v) }))}
                onMax={(v) => setDraft((d) => ({ ...d, areaMax: String(v) }))}
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>0 sqft</span>
                <span>5,000 sqft</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Builder</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setDraft((d) => ({ ...d, builder: "" }))}
                className={`flex items-center gap-3 rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
                  draft.builder === ""
                    ? "bg-accent-soft text-accent-dark"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Building2 size={16} aria-hidden />
                </span>
                All builders
                {draft.builder === "" && (
                  <Check size={18} strokeWidth={2.5} className="ml-auto text-accent" aria-hidden />
                )}
              </button>
              {(buildersData ?? []).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setDraft((d) => ({ ...d, builder: b.slug }))}
                  className={`flex items-center gap-3 rounded-input px-4 py-3 text-left text-sm font-medium transition-colors ${
                    draft.builder === b.slug
                      ? "bg-accent-soft text-accent-dark"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {b.logo ? (
                    <img
                      src={fileUrl(b.logo) ?? ""}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full bg-surface object-contain"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-blue text-xs font-bold text-white">
                      {b.companyName.charAt(0)}
                    </span>
                  )}
                  {b.companyName}
                  {draft.builder === b.slug && (
                    <Check size={18} strokeWidth={2.5} className="ml-auto text-accent" aria-hidden />
                  )}
                </button>
              ))}
              {(buildersData ?? []).length === 0 && (
                <p className="w-full py-8 text-center text-sm text-slate-400">No builders available</p>
              )}
            </div>
          </section>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 pt-8">
          <div className="h-14 w-full rounded-pill bg-slate-100" />
          <div className="mt-6 h-8 w-40 bg-slate-100" />
          <div className="mt-6">
            <ListGridSkeleton count={6} />
          </div>
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
