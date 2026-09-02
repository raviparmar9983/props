import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export function BuilderCta() {
  const builderUrl =
    process.env.NEXT_PUBLIC_BUILDER_APP_URL ?? "http://localhost:5173";

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      {/* <div className="relative overflow-hidden rounded-card bg-ink-blue p-6 text-white md:p-10">
        <span className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/25 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-accent text-white md:flex">
              <Building2 size={22} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold md:text-2xl">
                Are you a builder or developer?
              </h2>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-white/70">
                List your projects, manage unit inventory and receive buyer
                enquiries in one dashboard.
              </p>
            </div>
          </div>
          <Link
            href={builderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-white shadow-accent-button transition-colors hover:bg-accent-dark active:scale-[0.98]"
          >
            List your project
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div> */}
      {/* </div> */}
    </section>
  );
}
