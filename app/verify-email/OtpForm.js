"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const otpClassName =
  "h-14 w-full rounded-xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white placeholder:text-white/40 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 font-display";

const isFilled = (value) => value.trim().length > 0;

export default function OtpForm({
  otpError,
  redirectPath = "/profil",
  autoSendOtp = false,
}) {
  const inputRefs = useRef([]);
  const autoSendTriggeredRef = useRef(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [clientError, setClientError] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const isComplete = useMemo(
    () => otp.every((digit) => isFilled(digit)),
    [otp],
  );

  const handleChange = (index) => (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    const digit = value[value.length - 1];
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setClientError("");
    if (index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key !== "Backspace") return;
    if (otp[index]) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const next = Array(6)
      .fill("")
      .map((_, index) => pasted[index] || "");
    setOtp(next);
    setClientError("");
    const lastIndex = Math.min(pasted.length, 6) - 1;
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
    event.preventDefault();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isComplete || isSubmitting) {
      if (!isComplete) {
        setClientError("Veuillez saisir le code complet.");
      }
      return;
    }

    const verifyOtp = async () => {
      setIsSubmitting(true);
      setClientError("");
      setServerError("");
      setSuccessMessage("");
      try {
        const response = await fetch("/api/customers/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: otp.join("") }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.message || "Erreur serveur");
        }
        setSuccessMessage("Email vérifié avec succès.");
        router.refresh();
        router.replace(redirectPath || "/profil");
      } catch (error) {
        setServerError(error?.message || "Erreur serveur");
      } finally {
        setIsSubmitting(false);
      }
    };

    verifyOtp();
  };

  const handleResend = useCallback(async () => {
    if (isResending) return;
    setIsResending(true);
    setServerError("");
    setSuccessMessage("");
    try {
      const response = await fetch("/api/customers/resend-otp", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }
      setSuccessMessage(data?.message || "Code OTP renvoyé.");
    } catch (error) {
      setServerError(error?.message || "Erreur serveur");
    } finally {
      setIsResending(false);
    }
  }, [isResending]);

  useEffect(() => {
    if (!autoSendOtp || autoSendTriggeredRef.current) {
      return;
    }

    autoSendTriggeredRef.current = true;
    handleResend();
  }, [autoSendOtp, handleResend]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          <span>Code a 6 chiffres</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={`otp-${index}`}
              aria-label={`Chiffre ${index + 1}`}
              className={otpClassName}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              type="text"
              name={`otp-${index + 1}`}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={otp[index]}
              onChange={handleChange(index)}
              onKeyDown={handleKeyDown(index)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
            />
          ))}
        </div>
      </div>

      {otpError ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
          role="alert"
        >
          {otpError}
        </p>
      ) : null}

      {clientError ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
          role="alert"
        >
          {clientError}
        </p>
      ) : null}

      {serverError ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
          {successMessage}
        </p>
      ) : null}

      <button
        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent text-sm font-extrabold uppercase tracking-[0.3em] text-black shadow-[0_15px_35px_rgba(116,208,241,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={!isComplete || isSubmitting}
      >
        {isSubmitting ? "Verification..." : "Verifier"}
        <span aria-hidden="true">→</span>
      </button>

      <div className="text-center text-xs text-white font-body">
        Vous n&apos;avez pas recu de code ?{" "}
        <button
          className="text-accent underline underline-offset-4 transition hover:text-white"
          type="button"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? "Envoi..." : "Renvoyér le code"}
        </button>
      </div>
    </form>
  );
}
