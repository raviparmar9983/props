import { Building2 } from "lucide-react";

interface BrandMarkProps { inverse?: boolean; compact?: boolean; }

/** Text-based mark keeps the customer brand crisp at every breakpoint without a raster dependency. */
export function BrandMark({ inverse = false, compact = false }: BrandMarkProps) {
  const primary = inverse ? "text-white" : "text-ink-blue";
  const muted = inverse ? "text-white/70" : "text-slate-500";
  return <span className="inline-flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-input bg-accent-soft text-accent-dark"><Building2 size={20} strokeWidth={2.2} aria-hidden /></span><span className="leading-none"><span className={`block text-base font-bold tracking-tight ${primary}`}>Properties<span className="text-accent">Wale</span></span>{!compact && <span className={`mt-1 block text-[8px] font-semibold tracking-wide ${muted}`}>Verified Homes. Better Decisions.</span>}</span></span>;
}
