import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SearchX size={32} strokeWidth={2} aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">
        This property isn&apos;t live yet
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        The listing may still be under review, unpublished, or the link is
        incorrect. There are plenty more properties from verified builders to
        explore.
      </p>
      <Link
        href="/search"
        className="mt-6 inline-flex items-center gap-2 rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-white shadow-accent-button transition-colors hover:bg-accent-dark active:scale-[0.98]"
      >
        Browse other properties
        <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  );
}
