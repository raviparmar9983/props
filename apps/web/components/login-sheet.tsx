"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSheet } from "../lib/auth-sheet-store";
import { useAuth } from "../lib/hooks";
import { peekPendingAction } from "../lib/pendingAction";
import { savedPropertiesApi } from "../lib/api";
import { BottomSheet } from "./bottom-sheet";
import { PillButton } from "./pill-button";
import { CircleCheckBig } from "lucide-react";

function extractCooldownSeconds(err: unknown): number | null {
  const response = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  const text = Array.isArray(response) ? response.join(" ") : response;
  if (typeof text === "string") {
    const m = /(\d+)\s*s/.exec(text);
    if (m) return Number(m[1]);
  }
  return null;
}

export function LoginSheet() {
  const open = useAuthSheet((s) => s.open);
  const closeSheet = useAuthSheet((s) => s.closeSheet);
  const queryClient = useQueryClient();
  const {
    requestOtp,
    verifyOtp,
    isRequestingOtp,
    isVerifyingOtp,
    requestOtpError,
    verifyOtpError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setCooldown(0);
    setSucceeded(false);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  async function runPendingAction() {
    const pending = peekPendingAction();
    if (!pending || pending.type !== "SAVE_PROPERTY") return;
    await savedPropertiesApi.save(pending.projectId);
    sessionStorage.removeItem("pendingAction");
    queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
  }

  async function handleRequestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      const result = await requestOtp(email);
      setOtpSent(true);
      setCooldown(result.resendInSeconds ?? 30);
    } catch (err) {
      const remaining = extractCooldownSeconds(err);
      if (remaining) setCooldown(remaining);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    try {
      await verifyOtp(email, otp);
      await runPendingAction();
      setSucceeded(true);
      window.setTimeout(closeSheet, 900);
    } catch {
      // surfaced via verifyOtpError
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={closeSheet}
      title={succeeded ? "You're in" : "Login or Sign up"}
      subtitle={
        succeeded
          ? "Done — let's go."
          : otpSent
            ? `Enter the 6-digit code sent to ${email}`
            : "Enter your email to get a one-time code"
      }
    >
      {succeeded ? (
        <div className="flex flex-col items-center py-10">
          <div className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
            <CircleCheckBig size={32} strokeWidth={2.5} className="text-success" aria-hidden />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-slate-900">
            All set
          </p>
        </div>
      ) : !otpSent ? (
        <form onSubmit={handleRequestOtp} className="space-y-4 pb-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              Email
            </span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-input border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </label>
          {requestOtpError && (
            <p className="text-sm text-danger">
              Could not send the code. Check your email and try again.
            </p>
          )}
          <PillButton type="submit" full size="lg" disabled={isRequestingOtp}>
            {isRequestingOtp ? "Sending…" : "Get OTP"}
          </PillButton>
          <p className="text-center text-xs text-slate-400">
            We&apos;ll email you a code. No spam, ever.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 pb-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              One-time code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              placeholder="······"
              className="w-full rounded-input border border-slate-200 bg-surface px-4 py-3 text-center font-display text-lg font-semibold tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </label>
          {verifyOtpError && (
            <p className="text-sm text-danger">
              That code didn&apos;t match. Please try again.
            </p>
          )}
          <PillButton
            type="submit"
            full
            size="lg"
            disabled={isVerifyingOtp || otp.length < 6}
          >
            {isVerifyingOtp ? "Verifying…" : "Verify & continue"}
          </PillButton>
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="w-full text-center text-sm font-medium text-accent hover:text-accent-dark"
          >
            Change email
          </button>
          {cooldown > 0 ? (
            <p className="text-center text-xs text-slate-400">
              Resend code in {cooldown}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isRequestingOtp}
              className="w-full text-center text-sm font-medium text-accent hover:text-accent-dark disabled:opacity-50"
            >
              {isRequestingOtp ? "Resending…" : "Resend code"}
            </button>
          )}
        </form>
      )}
    </BottomSheet>
  );
}
