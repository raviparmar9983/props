"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookHeart, House, Search, type LucideIcon } from "lucide-react";

const TABS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Search", Icon: Search },
  // { href: "/saved", label: "Saved", Icon: BookHeart },
  { href: "/notifications", label: "Alerts", Icon: Bell },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-sticky-bar)] backdrop-blur-xl md:hidden"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
                active ? "text-ink-blue" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {active && <span className="absolute top-1 h-1 w-7 rounded-pill bg-accent" />}
              <tab.Icon
                size={22}
                fill="none"
                strokeWidth={active ? 2.4 : 1.9}
                aria-hidden
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
