"use client";

import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { getProjectContact } from "../lib/api";
import { useAuth } from "../lib/hooks";

interface ContactListProps {
  slug: string;
}

export function ContactList({ slug }: ContactListProps) {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ["projectContact", slug],
    queryFn: () => getProjectContact(slug),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!isAuthenticated || !data) return null;

  const contacts = data.contacts;
  if (contacts.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        Builder contacts
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Reach out directly — or use Express Interest above for a faster,
        tracked response.
      </p>
      <div className="mt-3 space-y-2">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-card border border-slate-200 bg-surface px-4 py-3 shadow-card"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{c.name}</p>
              <p className="text-xs text-slate-400">
                {c.designation ?? "Sales contact"}
              </p>
            </div>
            {c.phone && (
              <a
                href={`tel:${c.phone}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-accent/40 hover:text-accent"
              >
                <Phone size={12} aria-hidden />
                {c.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
