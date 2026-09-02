"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookHeart, Compass, House, UserRound } from "lucide-react";
import { useAuth } from "../lib/hooks";
import { useAuthSheet } from "../lib/auth-sheet-store";

const NAV_LINKS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Browse", Icon: Compass },
  { href: "/saved", label: "Saved", Icon: BookHeart },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const openAuth = useAuthSheet((state) => state.openSheet);

  return (
    <header className="sticky top-0 z-40 hidden border-b border-slate-200/90 bg-paper/90 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-8 px-4">
        <Link href="/" className="flex shrink-0 items-center rounded-input focus-visible:outline-offset-4" aria-label="VerifiedProps home">
          <img src="/logo-full.svg" alt="VerifiedProps" className="h-8 w-auto" />
        </Link>

        <nav className="flex items-center gap-1 rounded-pill bg-slate-100/80 p-1" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : l.href === "/search"
                ? pathname === "/search" || pathname.startsWith("/projects/")
                : pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-sm font-semibold ${
                  active
                    ? "bg-surface text-ink-blue shadow-sm"
                    : "text-slate-600 hover:text-ink-blue"
                }`}
              >
                <l.Icon size={16} strokeWidth={2} aria-hidden />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/notifications" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-ink-blue">
            <Bell size={19} strokeWidth={2} aria-hidden />
            {isAuthenticated && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />}
          </Link>
          {isAuthenticated ? (
            <Link href="/saved" className="inline-flex items-center gap-2 rounded-pill border border-slate-200 bg-surface px-3.5 py-2 text-sm font-semibold text-ink-blue hover:border-accent/60">
              <UserRound size={16} strokeWidth={2} aria-hidden />
              Account
            </Link>
          ) : (
            <button onClick={openAuth} className="inline-flex items-center gap-2 rounded-pill bg-ink-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blueprint">
              <UserRound size={16} strokeWidth={2} aria-hidden />
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
