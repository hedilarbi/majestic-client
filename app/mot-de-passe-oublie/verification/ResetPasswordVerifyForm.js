"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const otpInputClassName =
  "h-14 w-full rounded-xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white placeholder:text-white/40 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 font-display";

const inputClassName =
  "h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-12 text-white placeholder:text-white/35 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const isFilled = (value) => value.trim().length > 0;

export default function ResetPasswordVerifyForm({ email }) {
  const router = useRouter();
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [formValues, setFormValues] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [clientError, setClientError] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isComplete = useMemo(
    () => otp.every((digit) => isFilled(digit)),
    [otp],
  );

  const handleOtpChange = (index) => (event) => {
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

  const handleOtpKeyDown = (index) => (event) => {
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

  const handleOtpPaste = (event) => {
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setClientError("");
    setServerError("");
    setSuccessMessage("");

    if (!email) {
      setClientError("Email manquant.");
      return;
    }

    if (!isComplete) {
      setClientError("Veuillez saisir le code complet.");
      return;
    }

    if (!formValues.newPassword || !formValues.confirmPassword) {
      setClientError("Veuillez renseigner les mots de passe.");
      return;
    }

    if (formValues.newPassword !== formValues.confirmPassword) {
      setClientError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/customers/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          newPassword: formValues.newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }
      setSuccessMessage(data?.message || "Mot de passe reinitialise.");
      router.replace("/connexion");
    } catch (error) {
      setServerError(error?.message || "Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending || !email) return;
    setIsResending(true);
    setServerError("");
    setSuccessMessage("");
    try {
      const response = await fetch("/api/customers/forgot-password/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }
      setSuccessMessage(data?.message || "Code renvoyé.");
    } catch (error) {
      setServerError(error?.message || "Erreur serveur");
    } finally {
      setIsResending(false);
    }
  };

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
              className={otpInputClassName}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              type="text"
              name={`otp-${index + 1}`}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={otp[index]}
              onChange={handleOtpChange(index)}
              onKeyDown={handleOtpKeyDown(index)}
              onPaste={index === 0 ? handleOtpPaste : undefined}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
            />
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm font-body">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Nouveau mot de passe
        </span>
        <div className="relative">
          <input
            className={inputClassName}
            placeholder="••••••••"
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            autoComplete="new-password"
            value={formValues.newPassword}
            onChange={handleChange}
          />
          <button
            className="absolute inset-y-0 right-3 flex items-center text-white/50 transition hover:text-white"
            type="button"
            aria-label={
              showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            onClick={() => setShowNewPassword((current) => !current)}
          >
            {showNewPassword ? (
              <MdVisibilityOff className="h-5 w-5" />
            ) : (
              <MdVisibility className="h-5 w-5" />
            )}
          </button>
        </div>
      </label>

      <label className="flex flex-col gap-2 text-sm font-body">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Confirmation
        </span>
        <div className="relative">
          <input
            className={inputClassName}
            placeholder="••••••••"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            value={formValues.confirmPassword}
            onChange={handleChange}
          />
          <button
            className="absolute inset-y-0 right-3 flex items-center text-white/50 transition hover:text-white"
            type="button"
            aria-label={
              showConfirmPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            onClick={() => setShowConfirmPassword((current) => !current)}
          >
            {showConfirmPassword ? (
              <MdVisibilityOff className="h-5 w-5" />
            ) : (
              <MdVisibility className="h-5 w-5" />
            )}
          </button>
        </div>
      </label>

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
        {isSubmitting ? "Mise à jour..." : "Reinitialiser"}
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
