"use client";

import Link from "next/link";
import { BookmarkX, Heart, MapPin } from "lucide-react";
import { AuthPrompt } from "../../components/auth-prompt";
import { PillButton } from "../../components/pill-button";
import { ResilientImage } from "../../components/resilient-image";
import { Skeleton } from "../../components/skeleton";
import { fileUrl, formatPrice } from "../../lib/format";
import { useAuth, useSavedProperties, useUnsaveProperty } from "../../lib/hooks";

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const saved = useSavedProperties();
  const unsave = useUnsaveProperty();

  if (!isAuthenticated) {
    return (
      <AuthPrompt
        title="Save homes you want to revisit"
        subtitle="Sign in with a one-time code to keep your shortlist in one place."
      />
    );
  }

  if (saved.isPending) return <SavedSkeleton />;

  if (saved.isError) {
    return (
      <PageState
        title="Your saved homes couldn't load"
        body="Check your connection and try again."
        action="Try again"
        onAction={() => void saved.refetch()}
      />
    );
  }

  const properties = saved.data?.data ?? [];

  if (properties.length === 0) {
    return (
      <PageState
        title="Your shortlist is waiting"
        body="Save projects while browsing to compare them later."
        action="Browse verified projects"
        href="/search"
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 pb-28 md:py-10">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-accent-dark">
        Your shortlist
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
        Saved properties
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        The homes worth a second look.
      </p>

      <div className="stagger mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((item) => {
          const image =
            item.project.media.find((media) => media.isPrimary)?.url ??
            item.project.media[0]?.url;
          const starting =
            item.project.unitTypes
              .map((unit) => unit.price)
              .filter((price) => Number.isFinite(price))
              .sort((a, b) => a - b)[0] ?? null;

          return (
            <article
              key={item.projectId}
              className="group overflow-hidden rounded-card-xl bg-surface p-1.5 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover"
            >
              <Link href={`/projects/${item.project.slug}`} className="block">
                <div className="aspect-[4/3] overflow-hidden rounded-image-xl">
                  <ResilientImage
                    src={fileUrl(image)}
                    alt={`${item.project.title} property photo`}
                    className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="px-2 pt-3">
                  <h2 className="truncate font-display text-lg font-semibold text-slate-900">
                    {item.project.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} className="shrink-0 text-accent" aria-hidden />
                    <span className="truncate">
                      {item.project.locality.name}, {item.project.city.name}
                    </span>
                  </p>
                  <p className="mt-3 font-mono text-base font-semibold text-slate-900">
                    {formatPrice(starting)}
                  </p>
                </div>
              </Link>
              <div className="mt-2 border-t border-slate-100 px-2 py-3">
                <button
                  onClick={() => unsave.mutate(item.projectId)}
                  disabled={unsave.isPending}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-danger disabled:opacity-50"
                >
                  <Heart size={16} fill="currentColor" aria-hidden />
                  Remove from saved
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SavedSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-10 w-52" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-[4/5] rounded-card" />
        ))}
      </div>
    </div>
  );
}

function PageState({
  title,
  body,
  action,
  href,
  onAction,
}: {
  title: string;
  body: string;
  action: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
        <BookmarkX size={28} aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
        {body}
      </p>
      <div className="mt-6">
        {href ? (
          <Link href={href}>
            <PillButton>{action}</PillButton>
          </Link>
        ) : (
          <PillButton onClick={onAction}>{action}</PillButton>
        )}
      </div>
    </div>
  );
}
