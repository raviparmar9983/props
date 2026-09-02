import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";

interface FooterCity {
  slug: string;
  name: string;
}

interface SiteFooterProps {
  cities?: FooterCity[];
}

const CATEGORY_LINKS = [
  { label: "Flats & Apartments", href: "/search?propertyType=FLAT" },
  { label: "Houses & Villas", href: "/search?propertyType=HOUSE" },
  { label: "Plots & Land", href: "/search?propertyType=PLOT" },
  { label: "Shops & Commercial", href: "/search?propertyType=SHOP" },
  { label: "All properties", href: "/search" },
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
];

export function SiteFooter({ cities = [] }: SiteFooterProps) {
  const builderUrl =
    process.env.NEXT_PUBLIC_BUILDER_APP_URL ?? "http://localhost:5173";

  return (
    <footer className="mt-14 hidden border-t border-slate-200 bg-slate-50 md:block">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo-full.svg" alt="VerifiedProps" className="h-8 w-auto" />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              A curated marketplace of new properties from verified builders.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Explore
            </p>
            <ul className="mt-3 space-y-2">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Company
            </p>
            <ul className="mt-3 space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={builderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-accent"
                >
                  <Building2 size={14} aria-hidden />
                  Builder login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Contact
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="shrink-0" aria-hidden />
                support@verifiedprops.com
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="shrink-0" aria-hidden />
                +91 00000 00000
              </li>
            </ul>
          </div>
        </div>

        {cities.length > 0 && (
          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Browse by city
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/search?city=${encodeURIComponent(city.slug)}`}
                  className="rounded-pill border border-slate-200 bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} VerifiedProps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
