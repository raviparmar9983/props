import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { FooterNewsletter } from "./footer-newsletter";

export function SiteFooter() {
  const builderBase = (
    process.env.NEXT_PUBLIC_BUILDER_APP_URL ?? "https://builder.propertieswale.in"
  ).replace(/\/+$/, "");

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 pr-6">
            <BrandMark />
            <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-xs">
              India&apos;s trusted platform to discover properties from verified builders. No brokers. No confusion. Just better homes.
            </p>
            {/* Social Icons */}
            <div className="mt-4 flex items-center gap-3 text-slate-600">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 hover:text-ink-blue">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 hover:text-ink-blue">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 hover:text-ink-blue">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 hover:text-ink-blue">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <p className="text-xs font-bold text-slate-800">Quick Links</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li><Link href="/" className="hover:text-accent">Home</Link></li>
              <li><Link href="/search" className="hover:text-accent">Properties</Link></li>
              <li><Link href="/#builders" className="hover:text-accent">Builders</Link></li>
              <li><Link href="/#cities" className="hover:text-accent">Cities</Link></li>
              <li><Link href="/#about" className="hover:text-accent">About Us</Link></li>
            </ul>
          </div>

          {/* Col 3: For Users */}
          <div>
            <p className="text-xs font-bold text-slate-800">For Users</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li><Link href="/#how-it-works" className="hover:text-accent">How It Works</Link></li>
              <li><Link href="/search" className="hover:text-accent">Search Properties</Link></li>
              <li><Link href="/#builders" className="hover:text-accent">Verified Builders</Link></li>
            </ul>
          </div>

          {/* Col 4: For Builders */}
          <div>
            <p className="text-xs font-bold text-slate-800">For Builders</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li><a href={builderBase} target="_blank" rel="noreferrer" className="hover:text-accent">List Your Project</a></li>
              <li><a href={`${builderBase}/login`} target="_blank" rel="noreferrer" className="hover:text-accent">Builder Login</a></li>
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="md:col-span-1">
            <p className="text-xs font-bold text-slate-800">Newsletter</p>
            <p className="mt-2 text-xs text-slate-500">Get the latest property updates.</p>
            <FooterNewsletter />
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-slate-100 pt-6 text-[11px] text-slate-400 sm:flex-row">
          <p>© 2025 PropertiesWale. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Made with <span className="text-red-500">❤️</span> in India</p>
        </div>
      </div>
    </footer>
  );
}

