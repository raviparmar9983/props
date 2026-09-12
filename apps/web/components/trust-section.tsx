import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Verified builders",
    copy: "Every builder is manually vetted before their projects go live.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent pricing",
    copy: "Published prices and unit types — no hidden markups.",
  },
  {
    icon: Building2,
    title: "Direct contact",
    copy: "Talk to the builder team directly. No brokers, no middlemen.",
  },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      {/* <div className="rounded-card-xl bg-accent-soft/60 p-5 md:p-8">
        <h2 className="text-center font-display text-xl font-semibold text-slate-900 md:text-2xl">
          Why buy through us
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-center text-sm leading-relaxed text-slate-500">
          We only list projects from verified builders, so you buy with
          confidence.
        </p>
        <div className="stagger mt-5 grid gap-3 sm:grid-cols-3">
          {POINTS.map((point) => (
            <div
              key={point.title}
              className="rounded-card bg-surface p-4 shadow-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-accent-soft text-accent">
                <point.icon size={18} strokeWidth={2} aria-hidden />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-slate-900">
                {point.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {point.copy}
              </p>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
