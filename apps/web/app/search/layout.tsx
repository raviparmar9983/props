import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Properties — Flats, Houses, Plots | VerifiedProps",
  description:
    "Search verified real estate projects by city, locality, price, property type and amenities. Find flats, houses, plots and commercial spaces from verified builders with transparent pricing.",
  keywords: [
    "property search",
    "search flats",
    "search houses",
    "search plots",
    "real estate search",
    "property finder",
    "find property",
    "verified builders near me",
    "flats for sale",
    "houses for sale",
    "plots for sale",
    "commercial property search",
  ],
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search Properties — VerifiedProps",
    description:
      "Search verified real estate projects by city, locality, price, property type and amenities.",
    url: "/search",
    siteName: "VerifiedProps",
    locale: "en_IN",
    type: "website",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
