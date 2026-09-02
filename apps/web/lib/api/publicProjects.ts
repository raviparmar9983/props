import { serverFetch, NotFoundError } from "./serverFetch";
import apiClient from "./client";
import type {
  PublicProjectSummary,
  PublicProjectDetail,
  ProjectContact,
  SearchResponse,
  City,
  Locality,
  Amenity,
  PublicStats,
  PublicBuilder,
  PublicBuilderDetail,
  CompareResponse,
  SuggestProject,
} from "../../types/public";

export type ProjectSort = "newest" | "price_asc" | "price_desc" | "featured";

export interface ProjectSearchParams {
  q?: string;
  city?: string;
  localityId?: string;
  builder?: string;
  propertyType?: string;
  bedrooms?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  verifiedOnly?: boolean;
  possessionStatus?: string;
  page?: number;
  limit?: number;
  sort?: ProjectSort;
}

export function buildQueryString(params: ProjectSearchParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === "" ||
      value === false ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }
    q.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  return q.toString();
}

export function searchProjects(
  params: ProjectSearchParams,
  opts?: RequestInit & { revalidate?: number },
) {
  const qs = buildQueryString(params);
  return serverFetch<SearchResponse<PublicProjectSummary>>(
    `/public/projects${qs ? `?${qs}` : ""}`,
    { revalidate: 60, ...opts },
  );
}

export async function getProjectBySlug(slug: string) {
  try {
    return await serverFetch<PublicProjectDetail>(
      `/public/projects/${slug}`,
      { revalidate: 300 },
    );
  } catch (e) {
    if (e instanceof NotFoundError) throw e;
    throw e;
  }
}

export async function getProjectContact(slug: string) {
  const { data } = await apiClient.get<ProjectContact>(
    `/public/projects/${slug}/contact`,
  );
  return data;
}

export function getCities() {
  return serverFetch<City[]>("/public/cities", { revalidate: 86400 });
}

export function getLocalities(cityId: string) {
  return serverFetch<Locality[]>(
    `/public/localities?cityId=${cityId}`,
    { revalidate: 86400 },
  );
}

export function getAmenities() {
  return serverFetch<Amenity[]>("/public/amenities", { revalidate: 86400 });
}

export function getBuilders() {
  return serverFetch<PublicBuilder[]>("/public/builders", { revalidate: 300 });
}

export async function getBuilderBySlug(slug: string) {
  return serverFetch<PublicBuilderDetail>(`/public/builders/${slug}`, {
    revalidate: 300,
  });
}

export function getPublicStats() {
  return serverFetch<PublicStats>("/public/stats", { revalidate: 300 });
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const result = await serverFetch<SearchResponse<PublicProjectSummary>>(
      `/public/projects?page=${page}&limit=${limit}`,
      { revalidate: 300 },
    );
    slugs.push(...result.data.map((p) => p.slug));
    if (page * limit >= result.meta.total) break;
    page++;
  }

  return slugs;
}

export async function compareProjects(slugs: string[]) {
  const qs = slugs.map(s => encodeURIComponent(s)).join(",");
  return serverFetch<CompareResponse>(
    `/public/projects/compare?slugs=${qs}`,
    { revalidate: 60 },
  );
}

export async function suggestProjects(q: string, limit: number = 6): Promise<SuggestProject[]> {
  if (q.trim().length < 2) return [];
  const { data } = await apiClient.get<SuggestProject[]>(
    `/public/projects/suggest?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
  return data;
}
