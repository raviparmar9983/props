import { Banknote, Landmark as LandmarkIcon, ShieldCheck } from "lucide-react";
import { fileUrl, formatPrice } from "../lib/format";

interface PaymentPlansProps {
  plans: {
    id: string;
    name: string;
    type: string;
    bookingAmount: number | string;
    milestones: Record<string, unknown>[];
  }[];
  bankPartners: { id: string; bankName: string; logoUrl: string | null }[];
}

const PLAN_TYPE_LABELS: Record<string, string> = {
  CONSTRUCTION_LINKED: "Construction-linked",
  POSSESSION_LINKED: "Possession-linked",
  FLEXI: "Flexi / Subvention",
};

function planTypeLabel(type: string): string {
  return PLAN_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

function toNumber(value: number | string): number {
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function milestoneParts(m: Record<string, unknown>): {
  title: string;
  percent: string;
  amount: string;
} {
  const pick = (keys: string[]) => {
    for (const key of keys) {
      const v = m[key];
      if (v !== undefined && v !== null && String(v) !== "") return String(v);
    }
    return "";
  };
  const title = pick(["label", "name", "title", "milestone", "stage"]);
  const percent = pick(["percent", "percentage", "pct"]);
  const amount = pick(["amount", "payable", "value", "price"]);
  return { title, percent, amount };
}

export function PaymentPlans({ plans, bankPartners }: PaymentPlansProps) {
  if (plans.length === 0 && bankPartners.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        Payment plans & home loans
      </h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {plans.length > 0 &&
          plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-card border border-slate-200 bg-surface p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-base font-semibold text-slate-900">
                  {plan.name}
                </p>
                <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-dark">
                  {planTypeLabel(plan.type)}
                </span>
              </div>
              {toNumber(plan.bookingAmount) > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  Booking amount{" "}
                  <span className="font-semibold text-slate-900">
                    {formatPrice(toNumber(plan.bookingAmount))}
                  </span>
                </p>
              )}
              {Array.isArray(plan.milestones) && plan.milestones.length > 0 ? (
                <ol className="mt-4 space-y-0">
                  {plan.milestones.map((m, i) => {
                    const parts = milestoneParts(m);
                    const last = i === plan.milestones.length - 1;
                    return (
                      <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                        {!last && (
                          <span className="absolute top-5 left-[7px] h-full w-px bg-slate-200" />
                        )}
                        <span className="relative z-10 mt-1 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-pill border-2 border-accent bg-surface">
                          <span className="h-1.5 w-1.5 rounded-pill bg-accent" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {parts.title || `Milestone ${i + 1}`}
                          </p>
                          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-400">
                            {parts.percent && <span>{parts.percent} of price</span>}
                            {parts.amount && <span>{parts.amount}</span>}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Plan milestones on request.
                </p>
              )}
            </div>
          ))}

        {bankPartners.length > 0 && (
          <div className="rounded-card border border-slate-200 bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-accent-soft text-accent">
                <LandmarkIcon size={15} aria-hidden />
              </span>
              <p className="text-sm font-semibold text-slate-900">
                Home loan partners
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Banks offering loans for this project
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {bankPartners.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-2 rounded-pill border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700"
                >
                  {b.logoUrl ? (
                    <img
                      src={fileUrl(b.logoUrl) ?? ""}
                      alt=""
                      className="h-4 w-4 rounded-sm object-contain"
                    />
                  ) : (
                    <ShieldCheck size={14} className="text-accent" aria-hidden />
                  )}
                  {b.bankName}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-input bg-success-soft px-4 py-3">
              <Banknote size={15} className="text-success" aria-hidden />
              <p className="text-xs font-medium text-success">
                EMI calculators in the "Price & EMI" section use a standard 8.5%
                rate — actual rates depend on the bank.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
