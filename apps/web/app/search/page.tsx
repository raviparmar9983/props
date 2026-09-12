"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  searchProjects,
  getCities,
  getLocalities,
} from "../../lib/api";
import type { ProjectSearchParams, ProjectSort } from "../../lib/api/publicProjects";
import { ProjectCard } from "../../components/project-card";
import { HorizontalProjectCard } from "../../components/horizontal-project-card";
import { HeroSearchCard } from "../../components/hero-search-card";
import { ListGridSkeleton } from "../../components/skeleton";
import type { PublicProjectSummary } from "../../types/public";
import {
  ArrowRight,
  Grid,
  List,
  SearchX,
  X,
} from "lucide-react";

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const PROPERTY_TYPES = [
  { type: "Flat", val: "FLAT" },
  { type: "House", val: "HOUSE" },
  { type: "Plot", val: "PLOT" },
  { type: "Commercial", val: "CORPORATE" },
  { type: "Shop", val: "SHOP" },
];

const POSSESSION_OPTIONS = [
  { label: "Ready to Move", val: "READY" },
  { label: "Under Construction", val: "UNDER_CONSTRUCTION" },
  { label: "New Launch", val: "UPCOMING" },
];

function formatBudgetChip(min: string, max: string): string | null {
  const minL = Number(min);
  const maxL = Number(max);
  if (minL <= 0 && maxL >= 500) return null;
  const fmt = (v: number) => (v >= 100 ? `₹${v / 100}Cr` : `₹${v}L`);
  if (minL > 0 && maxL < 500) return `${fmt(minL)} - ${fmt(maxL)}`;
  if (minL > 0) return `${fmt(minL)}+`;
  if (maxL < 500) return `Under ${fmt(maxL)}`;
  return null;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const localityId = searchParams.get("localityId") ?? "";
  const propertyType = useMemo(() => splitCsv(searchParams.get("propertyType")), [searchParams]);
  const bedrooms = useMemo(() => splitCsv(searchParams.get("bedrooms")), [searchParams]);
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const possessionStatus = useMemo(() => splitCsv(searchParams.get("possessionStatus")), [searchParams]);
  const verified = searchParams.get("verifiedOnly") === "true";
  const sort = (searchParams.get("sort") || "newest") as ProjectSort;

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCity, setSelectedCity] = useState(city);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(localityId ? [localityId] : []);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    propertyType.length > 0 ? propertyType : [],
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>(bedrooms);
  const [selectedPossession, setSelectedPossession] = useState<string[]>(possessionStatus);
  const [showReraOnly, setShowReraOnly] = useState(verified);
  const [budgetMin, setBudgetMin] = useState(minPrice ? String(Number(minPrice) / 100000) : "0");
  const [budgetMax, setBudgetMax] = useState(maxPrice ? String(Number(maxPrice) / 100000) : "500");

  // The URL is the source of truth: browser navigation, a shared link, and chip
  // removal must all update the form controls as well as the results request.
  useEffect(() => {
    setSelectedCity(city);
    setSelectedLocalities(localityId ? [localityId] : []);
    setSelectedPropertyTypes(propertyType);
    setSelectedBedrooms(bedrooms);
    setSelectedPossession(possessionStatus);
    setShowReraOnly(verified);
    setBudgetMin(minPrice ? String(Number(minPrice) / 100000) : "0");
    setBudgetMax(maxPrice ? String(Number(maxPrice) / 100000) : "500");
  }, [city, localityId, propertyType, bedrooms, possessionStatus, verified, minPrice, maxPrice]);

  const apiParams = useMemo<ProjectSearchParams>(() => {
    const p: ProjectSearchParams = { limit: 10 };
    if (q) p.q = q;
    if (selectedCity) p.city = selectedCity;
    const locId = selectedLocalities[0];
    if (locId) p.localityId = locId;
    if (selectedPropertyTypes.length) p.propertyType = selectedPropertyTypes.join(",");
    if (selectedBedrooms.length) p.bedrooms = selectedBedrooms.join(",");
    if (Number(budgetMin) > 0) p.minPrice = Number(budgetMin) * 100000;
    if (Number(budgetMax) < 500) p.maxPrice = Number(budgetMax) * 100000;
    if (selectedPossession.length) p.possessionStatus = selectedPossession.join(",");
    if (showReraOnly) p.verifiedOnly = true;
    if (sort !== "newest") p.sort = sort;
    return p;
  }, [
    q, selectedCity, selectedLocalities, selectedPropertyTypes, selectedBedrooms,
    budgetMin, budgetMax, selectedPossession, showReraOnly, sort,
  ]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["projects", apiParams],
    queryFn: ({ pageParam }) => searchProjects({ ...apiParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page * last.meta.limit < last.meta.total ? last.meta.page + 1 : undefined,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: Infinity,
  });

  const cityObj = citiesData?.find((c) => c.slug === selectedCity);
  const cityName = selectedCity
    ? cityObj?.name ?? selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)
    : "All cities";

  function searchHref(params: URLSearchParams): string {
    const query = params.toString();
    return query ? `/search?${query}` : "/search";
  }

  const { data: localitiesData } = useQuery({
    queryKey: ["localities", cityObj?.id],
    queryFn: () => getLocalities(cityObj!.id),
    enabled: Boolean(cityObj?.id),
    staleTime: Infinity,
  });

  function applyFilters() {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (selectedCity) sp.set("city", selectedCity);
    const locIdParam = selectedLocalities[0];
    if (locIdParam) sp.set("localityId", locIdParam);
    if (selectedPropertyTypes.length) sp.set("propertyType", selectedPropertyTypes.join(","));
    if (selectedBedrooms.length) sp.set("bedrooms", selectedBedrooms.join(","));
    if (Number(budgetMin) > 0) sp.set("minPrice", String(Number(budgetMin) * 100000));
    if (Number(budgetMax) < 500) sp.set("maxPrice", String(Number(budgetMax) * 100000));
    if (selectedPossession.length) sp.set("possessionStatus", selectedPossession.join(","));
    if (showReraOnly) sp.set("verifiedOnly", "true");
    if (sort !== "newest") sp.set("sort", sort);
    router.push(searchHref(sp));
  }

  function clearAllFilters() {
    setSelectedCity("");
    setSelectedLocalities([]);
    setSelectedPropertyTypes([]);
    setSelectedBedrooms([]);
    setSelectedPossession([]);
    setShowReraOnly(false);
    setBudgetMin("0");
    setBudgetMax("500");
    router.push("/search");
  }

  function removeFilter(key: string, value?: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (key === "city") {
      sp.delete("city");
      setSelectedCity("");
    } else if (key === "q") {
      sp.delete("q");
    } else if (key === "localityId") {
      sp.delete("localityId");
      setSelectedLocalities([]);
    } else if (key === "propertyType" && value) {
      const remaining = splitCsv(sp.get("propertyType")).filter((t) => t !== value);
      if (remaining.length) sp.set("propertyType", remaining.join(","));
      else sp.delete("propertyType");
      setSelectedPropertyTypes(remaining);
    } else if (key === "bedrooms") {
      sp.delete("bedrooms");
      setSelectedBedrooms([]);
    } else if (key === "budget") {
      sp.delete("minPrice");
      sp.delete("maxPrice");
      setBudgetMin("0");
      setBudgetMax("500");
    } else if (key === "verifiedOnly") {
      sp.delete("verifiedOnly");
      setShowReraOnly(false);
    } else if (key === "possessionStatus" && value) {
      const remaining = splitCsv(sp.get("possessionStatus")).filter((p) => p !== value);
      if (remaining.length) sp.set("possessionStatus", remaining.join(","));
      else sp.delete("possessionStatus");
      setSelectedPossession(remaining);
    }
    router.push(searchHref(sp));
  }

  const projects: PublicProjectSummary[] = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;
  const limit = data?.pages[0]?.meta.limit ?? 10;
  const currentPage = data?.pages.length ?? 1;
  const showingFrom = projects.length > 0 ? 1 : 0;
  const showingTo = Math.min(currentPage * limit, total);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; value?: string }[] = [];
    if (selectedCity) chips.push({ key: "city", label: cityName });
    if (q) chips.push({ key: "q", label: `Search: ${q}` });
    if (selectedLocalities.length) {
      const locality = localitiesData?.find((item) => item.id === selectedLocalities[0]);
      chips.push({ key: "localityId", label: locality?.name ?? "Selected locality" });
    }
    selectedPropertyTypes.forEach((pt) => {
      const label = PROPERTY_TYPES.find((p) => p.val === pt)?.type ?? pt;
      chips.push({ key: "propertyType", label, value: pt });
    });
    const budgetLabel = formatBudgetChip(budgetMin, budgetMax);
    if (budgetLabel) chips.push({ key: "budget", label: budgetLabel });
    if (selectedBedrooms.length) {
      chips.push({ key: "bedrooms", label: `${selectedBedrooms.join(", ")} BHK` });
    }
    if (showReraOnly) chips.push({ key: "verifiedOnly", label: "RERA Verified" });
    selectedPossession.forEach((p) => {
      const label = POSSESSION_OPTIONS.find((o) => o.val === p)?.label ?? p;
      chips.push({ key: "possessionStatus", label, value: p });
    });
    return chips;
  }, [selectedCity, cityName, q, selectedLocalities, localitiesData, selectedPropertyTypes, budgetMin, budgetMax, selectedBedrooms, showReraOnly, selectedPossession]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Search Hero Banner */}
      <section className="relative overflow-hidden bg-ink-blue py-10 px-6 text-white">
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
              initialCity={city}
              initialQuery={q}
            />
          </div>
        </div>
      </section>

      {/* Main Dual-Column Content */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-24 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* City Filter */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedLocalities([]);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="">All cities</option>
                  {citiesData?.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  )) ?? <option value="mumbai">Mumbai</option>}
                </select>
              </div>

              {/* Locality Checkboxes */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700">Locality</label>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs text-slate-600">
                  {(localitiesData ?? []).slice(0, 8).map((loc) => (
                    <label key={loc.id} className="flex cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedLocalities.includes(loc.id)}
                          onChange={() => {
                            if (selectedLocalities.includes(loc.id)) {
                              setSelectedLocalities([]);
                            } else {
                              setSelectedLocalities([loc.id]);
                            }
                          }}
                          className="rounded text-accent focus:ring-accent"
                        />
                        <span>{loc.name}</span>
                      </div>
                    </label>
                  ))}
                  {!localitiesData?.length && (
                    <p className="text-[11px] text-slate-400">Select a city to see localities</p>
                  )}
                </div>
              </div>

              {/* Property Type Checkboxes */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700">Property Type</label>
                <div className="mt-2 space-y-2 text-xs text-slate-600">
                  {PROPERTY_TYPES.map((pt) => (
                    <label key={pt.val} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPropertyTypes.includes(pt.val)}
                        onChange={() => {
                          if (selectedPropertyTypes.includes(pt.val)) {
                            setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== pt.val));
                          } else {
                            setSelectedPropertyTypes([...selectedPropertyTypes, pt.val]);
                          }
                        }}
                        className="rounded text-accent focus:ring-accent"
                      />
                      <span>{pt.type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700">Budget (₹)</label>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={`₹ ${budgetMin}L`}
                    onChange={(e) => setBudgetMin(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-center text-xs font-semibold text-slate-800"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="text"
                    value={Number(budgetMax) >= 500 ? "₹ 5 Cr+" : `₹ ${budgetMax}L`}
                    onChange={(e) => setBudgetMax(e.target.value.replace(/[^0-9]/g, "") || "500")}
                    className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-center text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* BHK Pills */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700">BHK</label>
                <div className="mt-2 flex items-center gap-2">
                  {["1", "2", "3", "4+"].map((bhk) => (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => {
                        if (selectedBedrooms.includes(bhk)) {
                          setSelectedBedrooms(selectedBedrooms.filter((b) => b !== bhk));
                        } else {
                          setSelectedBedrooms([...selectedBedrooms, bhk]);
                        }
                      }}
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
              </div>

              {/* Possession Checkboxes */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700">Possession</label>
                <div className="mt-2 space-y-2 text-xs text-slate-600">
                  {POSSESSION_OPTIONS.map((pos) => (
                    <label key={pos.val} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPossession.includes(pos.val)}
                        onChange={() => {
                          if (selectedPossession.includes(pos.val)) {
                            setSelectedPossession(selectedPossession.filter((p) => p !== pos.val));
                          } else {
                            setSelectedPossession([...selectedPossession, pos.val]);
                          }
                        }}
                        className="rounded text-accent focus:ring-accent"
                      />
                      <span>{pos.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RERA Verified Toggle */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={showReraOnly}
                    onChange={(e) => setShowReraOnly(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />
                  <span>Show only RERA verified</span>
                </label>
              </div>

              <button
                onClick={applyFilters}
                className="mt-6 w-full rounded-lg bg-ink-blue py-3 text-xs font-bold text-white shadow transition-colors hover:bg-ink-blue/90"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Right Results Column */}
          <main className="flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {total} properties in {cityName}
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Sort by:</span>
                  <select
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

                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    className={`rounded p-1.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400"}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    className={`rounded p-1.5 ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags Strip */}
            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <span
                    key={`${chip.key}-${chip.value ?? chip.label}`}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-ink-blue"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={() => removeFilter(chip.key, chip.value)}
                      aria-label={`Remove ${chip.label} filter`}
                    >
                      <X size={12} className="cursor-pointer" />
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

            {/* Project Results */}
            <div className="mt-6">
              {isLoading && <ListGridSkeleton count={6} />}

              {!isLoading && projects.length === 0 && (
                <div className="rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm">
                  <SearchX size={36} className="mx-auto text-slate-400" />
                  <p className="mt-4 text-lg font-bold text-slate-900">No properties match your filters</p>
                  <p className="mt-1 text-xs text-slate-500">Try adjusting your budget, BHK or locality filter.</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-white shadow"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {!isLoading && projects.length > 0 && (
                <div className={viewMode === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2" : "space-y-4"}>
                  {projects.map((project) =>
                    viewMode === "grid" ? (
                      <ProjectCard key={project.slug} project={project} />
                    ) : (
                      <HorizontalProjectCard key={project.slug} project={project} />
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Pagination / Load More */}
            {projects.length > 0 && (
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
                {hasNextPage ? (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load More Properties"}
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">All results loaded</p>
                )}
                <p className="text-xs text-slate-500">
                  Showing {showingFrom}-{showingTo} of {total} properties
                </p>
              </div>
            )}

            {/* Recommendation CTA Banner */}
            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink-blue p-6 text-white md:flex-row md:items-center">
              <div>
                <p className="text-base font-bold">Can&apos;t find what you&apos;re looking for?</p>
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
