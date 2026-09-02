"use client";

import { useState, type PropsWithChildren, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  items: { id: string; title: string; content: ReactNode }[];
  defaultOpenId?: string | null;
}

export function Accordion({ items, defaultOpenId = null }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  return (
    <div className="overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card">
      {items.map((item, i) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className={i > 0 ? "border-t border-slate-100" : ""}
          >
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="text-sm font-semibold text-slate-900">
                {item.title}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-slate-100 text-slate-500 transition-transform duration-[var(--duration-fast)] ${
                  open ? "rotate-180" : ""
                }`}
              >
                <ChevronDown size={14} aria-hidden />
              </span>
            </button>
            {open && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AccordionItemContent({ children }: PropsWithChildren) {
  return <>{children}</>;
}
