import { ArrowRight, SlidersHorizontal, PhoneCall, Search, Send } from "lucide-react";

const STEPS = [
  {
    step: 1,
    icon: Search,
    title: "Search",
    copy: "Browse properties by city, type and budget.",
  },
  {
    step: 2,
    icon: SlidersHorizontal,
    title: "Compare",
    copy: "View details, floor plans and compare options.",
  },
  {
    step: 3,
    icon: Send,
    title: "Express Interest",
    copy: "Tell the builder what you're looking for.",
  },
  {
    step: 4,
    icon: PhoneCall,
    title: "Get Contacted",
    copy: "Hear back directly — no brokers in between.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
          How It Works
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Find your dream property in 4 simple steps
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="relative flex flex-col rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-ink-blue">
                {step.step}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-ink-blue">
                <step.icon size={20} strokeWidth={2} aria-hidden />
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight size={18} className="absolute right-4 top-7 hidden text-slate-300 lg:block" aria-hidden />
              )}
            </div>

            <p className="mt-4 font-bold text-base text-slate-900">
              {step.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {step.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

