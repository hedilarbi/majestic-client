"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClassName =
  "h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/35 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Email requis.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/customers/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }
      setSuccessMessage(data?.message || "Code envoye.");
      router.push(
        `/mot-de-passe-oublie/verification?email=${encodeURIComponent(
          email.trim(),
        )}`,
      );
    } catch (error) {
      setErrorMessage(error?.message || "Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm font-body">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Email
        </span>
        <input
          className={inputClassName}
          placeholder="exemple@exemple.com"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      {errorMessage ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
          role="alert"
        >
          {errorMessage}
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
        disabled={isSubmitting}
      >
        {isSubmitting ? "Envoi..." : "Envoyer le code"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
