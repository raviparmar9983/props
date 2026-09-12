"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { leadsApi } from "../../lib/api";
import { useAuth } from "../../lib/hooks";
import { setPendingAction, consumePendingAction } from "../../lib/pendingAction";
import { useAuthSheet } from "../../lib/auth-sheet-store";
import { CircleCheck, LoaderCircle, Plus } from "lucide-react";

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
  const [selectedUnitId, setSelectedUnitId] = useState(unitTypes?.[0]?.id ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("I'm interested in this property...");
  const [agreed, setAgreed] = useState(true);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submitLead = useMutation({
    mutationFn: () => {
      const payload: {
        projectId: string;
        unitTypeId?: string;
        message?: string;
        contactName?: string;
        contactPhone?: string;
      } = { projectId };
      if (selectedUnitId) payload.unitTypeId = selectedUnitId;
      if (message.trim()) payload.message = message.trim();
      if (name.trim()) payload.contactName = name.trim();
      if (phone.trim()) payload.contactPhone = phone.trim();
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
    if (status === "sending" || !agreed) return;
    if (name.trim().length < 2) {
      setFormError("Enter your name so the builder knows who to contact.");
      return;
    }
    if (!/^[+()\-\s0-9]{7,24}$/.test(phone.trim())) {
      setFormError("Enter a valid phone number for the builder to contact you.");
      return;
    }
    setFormError(null);

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
      <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-50 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-ink-blue">
          <Plus size={24} />
        </span>
        <p className="font-bold text-base text-slate-900">Interest Already Submitted</p>
        <p className="text-xs text-slate-500">
          You&apos;ve already requested details for this property. {builderName ?? "Nova Estates"} will reach out to you shortly.
        </p>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-50 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CircleCheck size={24} />
        </span>
        <p className="font-bold text-base text-emerald-700">Interest Sent</p>
        <p className="text-xs text-slate-500">
          {builderName ?? "Nova Estates"} will reach out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-slate-900">
      {/* Unit Dropdown */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          INTERESTED IN
        </label>
        <select
          value={selectedUnitId}
          onChange={(e) => setSelectedUnitId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-accent"
        >
          {unitTypes && unitTypes.length > 0 ? (
            unitTypes.map((ut) => (
              <option key={ut.id} value={ut.id}>
                {ut.label}
              </option>
            ))
          ) : (
            <option value="">Corner Plot</option>
          )}
        </select>
      </div>

      {/* Name Input */}
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          autoComplete="name"
          required
          minLength={2}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-accent focus:bg-white"
        />
      </div>

      {/* Phone Input */}
      <div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your Phone Number"
          autoComplete="tel"
          inputMode="tel"
          required
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-accent focus:bg-white"
        />
      </div>

      {/* Message Textarea */}
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-accent focus:bg-white resize-none"
        />
      </div>

      {/* Agreement Checkbox */}
      <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded text-accent focus:ring-accent"
        />
        <span>I agree to be contacted by {builderName ?? "Nova Estates"}.</span>
      </label>

      {formError && <p className="text-xs font-medium text-danger" role="alert">{formError}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "sending" || !agreed}
        className="w-full rounded-lg bg-accent py-3 text-xs font-bold text-white shadow transition-colors hover:bg-accent-dark disabled:opacity-50"
      >
        {status === "sending" ? (
          <span className="flex items-center justify-center gap-2">
            <LoaderCircle size={16} className="animate-spin" />
            Sending...
          </span>
        ) : (
          "Contact Builder"
        )}
      </button>

      <p className="text-center text-[10px] text-slate-400">
        No spam, no calls from brokers — only {builderName ?? "Nova Estates"}.
      </p>
    </form>
  );
}
