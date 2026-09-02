import { ClipboardList, PhoneCall, Search, Send } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search",
    copy: "Browse properties by city, type and budget.",
  },
  {
    icon: ClipboardList,
    title: "Compare",
    copy: "Weigh verified builders side by side.",
  },
  {
    icon: Send,
    title: "Express interest",
    copy: "Tell the builder what you're looking for.",
  },
  {
    icon: PhoneCall,
    title: "Get contacted",
    copy: "Hear back directly — no brokers in between.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h2 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
        How it works
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-card border border-slate-200 bg-surface p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-accent-soft text-accent">
                <step.icon size={18} strokeWidth={2} aria-hidden />
              </span>
              <span className="font-display text-2xl font-bold text-slate-200">
                {i + 1}
              </span>
            </div>
            <p className="mt-3 font-display text-base font-semibold text-slate-900">
              {step.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {step.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
