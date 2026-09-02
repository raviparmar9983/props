import {
  BadgeCheck,
  CalendarDays,
  Construction,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";
import type { PublicProjectDetail } from "../types/public";
import { formatPossessionDate, formatStatusLabel } from "../lib/format";

interface TrustLegalProps {
  project: PublicProjectDetail;
}

interface InfoTile {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  sub?: string;
}

export function TrustLegal({ project }: TrustLegalProps) {
  const possession = formatPossessionDate(project.possessionDate);
  const statusLabel = formatStatusLabel(project.status);
  const verified = project.builder.verificationStatus === "VERIFIED";

  const tiles: InfoTile[] = [
    {
      icon: FileCheck2,
      iconClass: "bg-success-soft text-success",
      label: "RERA",
      value: project.reraProjectNumber ? "Registered" : "On request",
      ...(project.reraProjectNumber ? { sub: project.reraProjectNumber } : {}),
    },
    ...(possession
      ? [
          {
            icon: CalendarDays,
            iconClass: "bg-accent-soft text-accent-dark",
            label: "Possession",
            value: possession,
          },
        ]
      : []),
    ...(statusLabel
      ? [
          {
            icon: Construction,
            iconClass: "bg-accent-soft text-accent-dark",
            label: "Project status",
            value: statusLabel,
          },
        ]
      : []),
    ...(verified
      ? [
          {
            icon: BadgeCheck,
            iconClass: "bg-rating-gold/15 text-[#9A6B12]",
            label: "Builder",
            value: project.builder.companyName,
            sub: "Verified by VerifiedProps",
          },
        ]
      : []),
  ];

  if (tiles.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tile.iconClass}`}
              >
                <tile.icon size={15} strokeWidth={2.2} aria-hidden />
              </span>
              <p className="truncate text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                {tile.label}
              </p>
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-slate-900">
              {tile.value}
            </p>
            {tile.sub && (
              <p className="mt-0.5 truncate text-xs text-slate-400" title={tile.sub}>
                {tile.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
