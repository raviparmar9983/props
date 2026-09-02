import Link from "next/link";
import type { Metadata } from "next";
import { compareProjects } from "../../lib/api";
import { formatPrice, formatStatusLabel, fileUrl } from "../../lib/format";
import { CompareClient } from "../../components/compare-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Compare Properties Side by Side — VerifiedProps",
  description:
    "Compare flats, houses and plots from verified builders side by side. Analyze pricing, amenities, location and specifications to make informed real estate decisions.",
  keywords: [
    "compare properties",
    "property comparison",
    "compare flats",
    "compare houses",
    "real estate comparison tool",
    "side by side property comparison",
  ],
  alternates: { canonical: "/compare" },
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ slugs?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { slugs: slugParam } = await searchParams;
  const slugs = slugParam
    ? slugParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (slugs.length < 2) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Compare Properties
        </h1>
        <p className="mt-3 text-slate-500">
          Select at least 2 properties to compare them side by side.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  let result;
  try {
    result = await compareProjects(slugs);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Compare Properties
        </h1>
        <p className="mt-3 text-slate-500">
          Something went wrong loading the comparison. Please try again.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  const { data, notFound } = result;

  if (data.length < 2) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Compare Properties
        </h1>
        <p className="mt-3 text-slate-500">
          Not enough valid properties found for comparison.
          {notFound.length > 0 && (
            <> The following properties could not be found: {notFound.join(", ")}</>
          )}
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return <CompareClient projects={data} notFound={notFound} initialSlugs={slugs} />;
}
