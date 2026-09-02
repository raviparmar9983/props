import type { MetadataRoute } from "next";
import { getAllProjectSlugs, getBuilders, getCities } from "../lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const [projectSlugs, cities, builders] = await Promise.all([
      getAllProjectSlugs(),
      getCities(),
      getBuilders(),
    ]);

    const cityEntries: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${baseUrl}/search?city=${encodeURIComponent(city.slug)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const projectEntries: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const builderEntries: MetadataRoute.Sitemap = builders.map((builder) => ({
      url: `${baseUrl}/builders/${builder.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [
      ...staticEntries,
      ...cityEntries,
      ...projectEntries,
      ...builderEntries,
    ];
  } catch {
    return staticEntries;
  }
}
