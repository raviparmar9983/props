"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { leadsApi } from "../../lib/api";
import { useAuth } from "../../lib/hooks";
import { setPendingAction, consumePendingAction } from "../../lib/pendingAction";
import { useAuthSheet } from "../../lib/auth-sheet-store";
import { CircleCheck, LoaderCircle, Plus } from "lucide-react";
import { PillButton } from "../../components/pill-button";

export interface UnitOption {
  id: string;
  label: string;
  price: number;
}

interface InterestFormProps {
  projectId: string;
  unitTypes?: UnitOption[];
  builderName?: string;
  onSubmitted?: () => void;
}

type SubmitStatus = "idle" | "sending" | "sent" | "duplicate";

export function InterestForm({
  projectId,
  unitTypes,
  builderName,
  onSubmitted,
}: InterestFormProps) {
  const { isAuthenticated } = useAuth();
  const openAuth = useAuthSheet((s) => s.openSheet);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [waitingForAuth, setWaitingForAuth] = useState(false);

  const submitLead = useMutation({
    mutationFn: () => {
      const payload: {
        projectId: string;
        unitTypeId?: string;
        message?: string;
      } = { projectId };
      if (selectedUnitId) payload.unitTypeId = selectedUnitId;
      if (message.trim()) payload.message = message.trim();
      return leadsApi.submit(payload);
    },
    onSuccess: (data: { duplicate?: boolean }) => {
      setStatus(data?.duplicate ? "duplicate" : "sent");
      window.setTimeout(() => {
        onSubmitted?.();
      }, 1000);
    },
  });

  useEffect(() => {
    if (!waitingForAuth || !isAuthenticated) return;
    setWaitingForAuth(false);
    const pending = consumePendingAction();
    if (pending?.type === "EXPRESS_INTEREST" && pending.projectId === projectId) {
      setStatus("sending");
      submitLead.mutate();
    }
  }, [waitingForAuth, isAuthenticated, projectId, submitLead]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    if (!isAuthenticated) {
      const pending: {
        type: "EXPRESS_INTEREST";
        projectId: string;
        unitTypeId?: string;
        message?: string;
      } = { type: "EXPRESS_INTEREST", projectId };
      if (selectedUnitId) pending.unitTypeId = selectedUnitId;
      if (message.trim()) pending.message = message.trim();
      setPendingAction(pending);
      setWaitingForAuth(true);
      openAuth();
      return;
    }

    setStatus("sending");
    submitLead.mutate();
  }

  if (status === "duplicate") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card bg-info-soft px-5 py-8 text-center">
        <span className="animate-pop-in flex h-14 w-14 items-center justify-center rounded-full bg-info/10">
          <Plus
            size={28}
            strokeWidth={2.5}
            className="text-info"
            aria-hidden
          />
        </span>
        <p className="font-display text-lg font-semibold">
          Interest already submitted
        </p>
        <p className="text-sm text-slate-500">
          You've already expressed interest in this project.{" "}
          {builderName ?? "The builder"} will reach out to you shortly.
        </p>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card bg-success-soft px-5 py-8 text-center">
        <span className="animate-pop-in flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CircleCheck
            size={28}
            strokeWidth={2.5}
            className="text-success"
            aria-hidden
          />
        </span>
        <p className="font-display text-lg font-semibold text-success">
          Interest sent
        </p>
        <p className="text-sm text-slate-500">
          {builderName ?? "The builder"} will reach out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {unitTypes && unitTypes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Interested in
          </p>
          <div className="flex flex-wrap gap-2">
            {unitTypes.map((ut) => {
              const active = selectedUnitId === ut.id;
              return (
                <button
                  key={ut.id}
                  type="button"
                  onClick={() => setSelectedUnitId(active ? "" : ut.id)}
                  aria-pressed={active}
                  className={`rounded-pill border px-3.5 py-2 text-sm font-medium transition-all duration-[150ms] ease-[var(--ease-spring)] active:scale-[0.97] ${
                    active
                      ? "border-accent bg-accent text-white shadow-accent-button"
                      : "border-slate-200 bg-surface text-slate-600 hover:border-accent/40"
                  }`}
                >
                  {ut.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="interest-message"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400 uppercase"
        >
          Message (optional)
        </label>
        <textarea
          id="interest-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any specific requirements or questions?"
          rows={3}
          className="w-full resize-none rounded-input border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <PillButton
        type="submit"
        full
        size="lg"
        disabled={status === "sending"}
      >
        {status === "sending" ? (
          <>
            <LoaderCircle
              size={18}
              strokeWidth={3}
              className="animate-spin-slow"
              aria-hidden
            />
            Sending…
          </>
        ) : (
          "Contact Builder"
        )}
      </PillButton>

      {submitLead.isError && (
        <p className="text-center text-sm text-danger">
          Could not submit your interest. Please try again.
        </p>
      )}
      <p className="text-center text-xs text-slate-400">
        No spam, no calls from brokers — only {builderName ?? "the builder"}.
      </p>
    </form>
  );
}
