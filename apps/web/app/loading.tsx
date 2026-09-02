import { ChipRowSkeleton, ProjectCardSkeleton } from "../components/skeleton";

export default function Loading() {
  return (
    <div className="pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="h-14 w-full rounded-pill bg-slate-100" />
      </div>
      <div className="bg-ink-blue px-4 pt-8 pb-12 text-center">
        <div className="mx-auto h-8 w-2/3 max-w-md rounded-lg bg-white/10" />
        <div className="mx-auto mt-4 h-3 w-1/2 max-w-xs rounded-lg bg-white/10" />
        <div className="mx-auto mt-5 h-9 w-64 rounded-pill bg-white/10" />
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-40 shrink-0 rounded-card bg-slate-100"
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-card bg-slate-100" />
          ))}
        </div>
        <div className="mt-8 h-7 w-48 rounded-lg bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-card bg-slate-100" />
          ))}
        </div>
        <div className="mt-8">
          <ChipRowSkeleton />
        </div>
        <div className="mt-8">
          <ProjectCardSkeleton />
        </div>
      </div>
    </div>
  );
}
