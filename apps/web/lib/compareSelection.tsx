"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

const STORAGE_KEY = "compareSlugs";
const MAX = 3;

function readSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSlugs(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event("compare-slugs-changed"));
}

interface CompareSelectionState {
  slugs: string[];
  toggle: (slug: string) => { rejected: boolean };
  remove: (slug: string) => void;
  clear: () => void;
  isSelected: (slug: string) => boolean;
  count: number;
}

const Ctx = createContext<CompareSelectionState | null>(null);

export function CompareSelectionProvider({ children }: PropsWithChildren) {
  const [slugs, setSlugs] = useState<string[]>(readSlugs);

  useEffect(() => {
    const sync = () => setSlugs(readSlugs());
    window.addEventListener("compare-slugs-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("compare-slugs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const current = readSlugs();
      if (current.includes(slug)) {
        const updated = current.filter((s) => s !== slug);
        writeSlugs(updated);
        setSlugs(updated);
        return { rejected: false };
      }
      if (current.length >= MAX) {
        return { rejected: true };
      }
      const updated = [...current, slug];
      writeSlugs(updated);
      setSlugs(updated);
      return { rejected: false };
    },
    [],
  );

  const remove = useCallback((slug: string) => {
    const updated = readSlugs().filter((s) => s !== slug);
    writeSlugs(updated);
    setSlugs(updated);
  }, []);

  const clear = useCallback(() => {
    writeSlugs([]);
    setSlugs([]);
  }, []);

  const isSelected = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  const value = useMemo(
    () => ({ slugs, toggle, remove, clear, isSelected, count: slugs.length }),
    [slugs, toggle, remove, clear, isSelected],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompareSelection(): CompareSelectionState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompareSelection must be inside CompareSelectionProvider");
  return ctx;
}
