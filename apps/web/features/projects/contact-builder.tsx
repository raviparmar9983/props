"use client";

import { useState } from "react";
import { useAuth } from "../../lib/hooks";
import { useAuthSheet } from "../../lib/auth-sheet-store";
import { getProjectContact } from "../../lib/api";
import { Mail, Phone } from "lucide-react";
import { PillButton } from "../../components/pill-button";
import type { ProjectContact } from "../../types/public";

interface ContactBuilderProps {
  slug: string;
}

export function ContactBuilder({ slug }: ContactBuilderProps) {
  const { isAuthenticated } = useAuth();
  const openSheet = useAuthSheet((s) => s.openSheet);
  const [contact, setContact] = useState<ProjectContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReveal() {
    if (!isAuthenticated) {
      openSheet();
      return;
    }
    if (contact) return;
    setLoading(true);
    setError(null);
    try {
      setContact(await getProjectContact(slug));
    } catch {
      setError("Couldn't load contact details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <PillButton onClick={openSheet} variant="soft" size="sm">
        Contact builder
      </PillButton>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <PillButton
          onClick={handleReveal}
          variant="soft"
          size="sm"
          disabled={loading}
        >
          {loading ? "Loading…" : "Contact builder"}
        </PillButton>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

  const items: Array<{ label: string; value: string; href: string }> = [];
  if (contact.builder.phone) {
    items.push({
      label: contact.builder.companyName,
      value: contact.builder.phone,
      href: `tel:${contact.builder.phone}`,
    });
  }
  if (contact.builder.email) {
    items.push({
      label: contact.builder.companyName,
      value: contact.builder.email,
      href: `mailto:${contact.builder.email}`,
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark"
        >
          {item.value}
        </a>
      ))}
      {contact.contacts.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-2 text-right text-sm text-slate-600"
        >
          <div>
            <p className="font-semibold text-slate-900">{c.name}</p>
            {c.designation && (
              <p className="text-xs text-slate-400">{c.designation}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {c.phone && (
              <a
                href={`tel:${c.phone}`}
                className="flex h-9 w-9 items-center justify-center rounded-pill bg-accent-soft text-accent transition-colors hover:bg-accent hover:text-white"
                aria-label={`Call ${c.name}`}
              >
                <Phone size={16} aria-hidden />
              </a>
            )}
            {c.email && (
              <a
                href={`mailto:${c.email}`}
                className="flex h-9 w-9 items-center justify-center rounded-pill bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                aria-label={`Email ${c.name}`}
              >
                <Mail size={16} aria-hidden />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
