import { BadgeCheck, CalendarDays, Construction, FileCheck2 } from "lucide-react";
import type { PublicProjectDetail } from "../types/public";
import { formatPossessionDate, formatStatusLabel } from "../lib/format";

interface TrustLegalProps {
  project: PublicProjectDetail;
}

export function TrustLegal({ project }: TrustLegalProps) {
  const possession = formatPossessionDate(project.possessionDate);
  const statusLabel = formatStatusLabel(project.status);
  const verified = project.builder.verificationStatus === "VERIFIED";

  const items: { icon: typeof FileCheck2; label: string; value: string; tone: string }[] = [
    {
      icon: FileCheck2,
      label: "RERA Registered",
      value:
        project.reraProjectNumber ?? "Registration number on request",
      tone: "text-success",
    },
    possession && {
      icon: CalendarDays,
      label: "Possession",
      value: possession,
      tone: "text-accent",
    },
    statusLabel && {
      icon: Construction,
      label: "Project status",
      value: statusLabel,
      tone: "text-accent",
    },
    verified && {
      icon: BadgeCheck,
      label: "Builder",
      value: "Verified by VerifiedProps",
      tone: "text-[#9A6B12]",
    },
  ].filter(
    (item): item is { icon: typeof FileCheck2; label: string; value: string; tone: string } =>
      Boolean(item),
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2.5 rounded-card border border-slate-200 bg-surface px-4 py-3 shadow-card"
          >
            <span className={`mt-0.5 ${item.tone}`}>
              <item.icon size={16} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
