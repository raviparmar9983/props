import Link from "next/link";
import { ArrowRight, Building2, House } from "lucide-react";

export function BuilderCta() {
  const builderUrl =
    process.env.NEXT_PUBLIC_BUILDER_APP_URL ?? "https://builder.propertieswale.in";

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16">
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-8 text-white md:p-12">
        {/* Background image & gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              READY TO FIND YOUR DREAM PROPERTY?
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-white md:text-4xl">
              Verified Builders. Better Homes.
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Join thousands of home seekers who found their perfect property with PropertiesWale.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-xs font-semibold text-white shadow-md transition-colors hover:bg-accent-dark"
              >
                Explore Properties <ArrowRight size={15} aria-hidden />
              </Link>
              <a
                href={builderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                List Your Project <ArrowRight size={15} aria-hidden />
              </a>
            </div>
          </div>

          {/* Right Floating Badge Box */}
          <div className="flex shrink-0 items-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3 pr-4 border-r border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
                <House size={20} />
              </div>
              <div>
                <p className="font-bold text-lg text-white">100+</p>
                <p className="text-[10px] text-slate-300">Properties</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
                <Building2 size={20} />
              </div>
              <div>
                <p className="font-bold text-lg text-white">23+</p>
                <p className="text-[10px] text-slate-300">Verified Builders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

