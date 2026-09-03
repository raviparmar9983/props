"use client";

import { BellRing, CheckCheck, ChevronRight } from "lucide-react";
import { AuthPrompt } from "../../components/auth-prompt";
import { Skeleton } from "../../components/skeleton";
import {
  useAuth,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../lib/hooks";

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const notifications = useNotifications({ limit: 30 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  if (!isAuthenticated) {
    return (
      <AuthPrompt
        title="Stay in the loop"
        subtitle="Sign in to receive updates about your saved properties and builder responses."
      />
    );
  }

  if (notifications.isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-8">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-card" />
        ))}
      </div>
    );
  }

  if (notifications.isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
          <BellRing size={28} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-slate-900">
          Updates couldn&apos;t load
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
          Check your connection and try again.
        </p>
        <button
          onClick={() => void notifications.refetch()}
          className="mt-5 font-semibold text-blueprint transition-colors hover:text-ink-blue"
        >
          Try again
        </button>
      </div>
    );
  }

  const items = notifications.data?.data ?? [];
  const unread = items.filter((item) => !item.isRead).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-7 pb-28 md:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-accent-dark">
            Updates
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">
            Notifications
          </h1>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blueprint transition-colors hover:text-ink-blue disabled:opacity-50"
          >
            <CheckCheck size={17} aria-hidden />
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-card bg-surface p-10 text-center shadow-card">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <BellRing size={26} aria-hidden />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-slate-900">
            Nothing new yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Builder responses and property updates will appear here.
          </p>
        </div>
      ) : (
        <div className="stagger mt-7 overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!item.isRead) markRead.mutate(item.id);
              }}
              className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-colors last:border-0 hover:bg-slate-50 ${
                item.isRead ? "bg-surface" : "bg-accent-soft/30"
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.isRead ? "bg-transparent" : "bg-accent"
                }`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {item.title}
                </span>
                {item.body && (
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                    {item.body}
                  </span>
                )}
                <span className="mt-2 block text-xs font-medium text-slate-400">
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    new Date(item.createdAt),
                  )}
                </span>
              </span>
              <ChevronRight className="mt-1 shrink-0 text-slate-400" size={18} aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
