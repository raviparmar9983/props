import { Check, X as XIcon } from "lucide-react";

/** Turns an ENUM_LIKE_VALUE into a "Enum Like Value" pill. */
export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-slate-400">Not specified</span>;
  const label = value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="rounded-pill bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}

export function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check size={16} className="text-success" />
  ) : (
    <XIcon size={16} className="text-slate-300" />
  );
}
