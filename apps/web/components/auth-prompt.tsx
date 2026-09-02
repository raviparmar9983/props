"use client";

import { useAuthSheet } from "../lib/auth-sheet-store";
import { PillButton } from "./pill-button";
import { User } from "lucide-react";

interface AuthPromptProps {
  title: string;
  subtitle: string;
}

export function AuthPrompt({ title, subtitle }: AuthPromptProps) {
  const openAuth = useAuthSheet((s) => s.openSheet);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-accent-soft text-accent">
        <User size={28} strokeWidth={2} aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-xl font-semibold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      <PillButton onClick={openAuth} className="mt-6">
        Login with OTP
      </PillButton>
    </div>
  );
}
