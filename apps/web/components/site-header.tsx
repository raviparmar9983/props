"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Heart, UserRound } from "lucide-react";
import { useAuth, useSavedProperties } from "../lib/hooks";
import { useAuthSheet } from "../lib/auth-sheet-store";
import { BrandMark } from "./brand-mark";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Properties" },
  { href: "/builders", label: "Builders" },
  { href: "/cities", label: "Cities" },
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: savedData } = useSavedProperties();
  const openAuth = useAuthSheet((state) => state.openSheet);
  const builderUrl = process.env.NEXT_PUBLIC_BUILDER_APP_URL ?? "http://localhost:5173";
  const savedCount = savedData?.data.length ?? 0;

  return (
    <header className="sticky top-0 z-40 hidden border-b border-slate-100 bg-white/95 backdrop-blur-md md:block">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center focus-visible:outline-offset-4" aria-label="PropertiesWale home">
          <BrandMark />
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : l.href === "/search"
                ? pathname === "/search" || pathname.startsWith("/projects/")
                : pathname === l.href;
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "font-semibold text-accent"
                    : "text-slate-700 hover:text-accent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Wishlist Heart Icon with Count Badge */}
          <Link
            href="/saved"
            aria-label="Saved Wishlist Properties"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          >
            <Heart size={20} strokeWidth={1.8} className="text-slate-700" aria-hidden />
            {savedCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
                {savedCount}
              </span>
            )}
          </Link>

          {/* List Property Button */}
          <a
            href={builderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <Building2 size={15} strokeWidth={2} aria-hidden />
            List Property
          </a>

          {/* Sign In Button */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink-blue px-5 text-xs font-semibold text-white shadow-sm hover:bg-ink-blue/90"
            >
              <UserRound size={15} strokeWidth={2} aria-hidden />
              Account
            </Link>
          ) : (
            <button
              onClick={openAuth}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink-blue px-5 text-xs font-semibold text-white shadow-sm hover:bg-ink-blue/90"
            >
              <UserRound size={15} strokeWidth={2} aria-hidden />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
