"use client";

import { useMemo, useState } from "react";
import { Calculator, Receipt } from "lucide-react";
import { formatPrice } from "../lib/format";

interface PriceAndEmiProps {
  priceComponents: {
    id: string;
    label: string;
    amount: number | string;
    isIncludedInBasePrice: boolean;
  }[];
  startingPrice: number;
}

function toNumber(value: number | string): number {
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatEmi(amount: number): string {
  if (amount <= 0) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function PriceAndEmi({ priceComponents, startingPrice }: PriceAndEmiProps) {
  const includedAmount = priceComponents
    .filter((c) => c.isIncludedInBasePrice)
    .reduce((sum, c) => sum + toNumber(c.amount), 0);

  const basePrice = includedAmount > 0 ? includedAmount : startingPrice;

  const [loanAmount, setLoanAmount] = useState(basePrice);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const emi = useMemo(() => {
    const principal = Math.max(0, loanAmount);
    if (principal <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const r = interestRate / 100 / 12;
    const n = tenureYears * 12;
    if (r === 0) return { emi: principal / n, totalInterest: 0, totalPayment: principal };
    const factor = Math.pow(1 + r, n);
    const monthly = (principal * r * factor) / (factor - 1);
    const total = monthly * n;
    return {
      emi: monthly,
      totalInterest: total - principal,
      totalPayment: total,
    };
  }, [loanAmount, interestRate, tenureYears]);

  const extraComponents = priceComponents.filter((c) => !c.isIncludedInBasePrice);

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        Price & EMI
      </h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* Price breakdown */}
        <div className="rounded-card border border-slate-200 bg-surface p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-accent-soft text-accent">
              <Receipt size={15} aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">
              What you pay
            </p>
          </div>
          <dl className="mt-4 space-y-3">
            {priceComponents.length > 0 ? (
              <>
                {priceComponents.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <dt className="text-slate-600">
                      {c.label}
                      {c.isIncludedInBasePrice && (
                        <span className="ml-1.5 rounded-pill bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          included
                        </span>
                      )}
                    </dt>
                    <dd className="font-semibold text-slate-900">
                      {formatPrice(toNumber(c.amount))}
                    </dd>
                  </div>
                ))}
                {extraComponents.length > 0 && (
                  <div className="border-t border-dashed border-slate-200 pt-3">
                    <div className="flex items-start justify-between gap-3 text-sm font-semibold">
                      <dt className="text-slate-900">Base price</dt>
                      <dd className="font-display text-base font-bold text-slate-900">
                        {formatPrice(basePrice)}
                      </dd>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start justify-between gap-3 text-sm">
                <dt className="text-slate-600">Starting price</dt>
                <dd className="font-display text-base font-bold text-slate-900">
                  {formatPrice(basePrice)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* EMI calculator */}
        <div className="rounded-card border border-slate-200 bg-surface p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-accent-soft text-accent">
              <Calculator size={15} aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">
              Home loan EMI calculator
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Loan amount", value: formatEmi(loanAmount) },
              { label: "Rate (p.a.)", value: `${interestRate}%` },
              { label: "Tenure", value: `${tenureYears} yr` },
            ].map((s) => (
              <div key={s.label} className="rounded-input bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  {s.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Loan amount</span>
              <span className="text-slate-400">{formatEmi(loanAmount)}</span>
            </span>
            <input
              type="range"
              min={Math.round(basePrice * 0.1)}
              max={Math.round(basePrice)}
              step={10000}
              value={Math.min(loanAmount, Math.round(basePrice))}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
              aria-label="Loan amount"
            />
          </label>

          <label className="mt-3 block">
            <span className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Interest rate</span>
              <span className="text-slate-400">{interestRate}% p.a.</span>
            </span>
            <input
              type="range"
              min={6}
              max={13}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
              aria-label="Interest rate"
            />
          </label>

          <label className="mt-3 block">
            <span className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Tenure</span>
              <span className="text-slate-400">{tenureYears} years</span>
            </span>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
              aria-label="Tenure"
            />
          </label>

          <div className="mt-4 rounded-input bg-accent-soft px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-accent-dark uppercase">
              Monthly EMI
            </p>
            <p className="font-display text-xl font-bold text-slate-900">
              {formatEmi(emi.emi)} <span className="text-xs font-medium text-slate-500">/ month</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Interest {formatEmi(emi.totalInterest)} · Total {formatEmi(emi.totalPayment)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
