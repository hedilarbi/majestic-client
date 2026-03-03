"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const inputClassName =
  "h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-12 text-white placeholder:text-white/35 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const resolveRedirectPath = (value, fallback = "/profil") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
};

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  terms: false,
};

export default function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const redirectPath = resolveRedirectPath(searchParams?.get("redirect"));

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");

    if (!formValues.terms) {
      setErrorMessage("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    if (formValues.password !== formValues.passwordConfirm) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        email: formValues.email.trim(),
        password: formValues.password,
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        phone: formValues.phone.trim(),
      };
      const response = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }
      router.push(`/verify-email?redirect=${encodeURIComponent(redirectPath)}`);
    } catch (error) {
      setErrorMessage(error?.message || "Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-body">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
            Prénom
          </span>
          <input
            className={inputClassName}
            placeholder="Prénom"
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={formValues.firstName}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-body">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
            Nom
          </span>
          <input
            className={inputClassName}
            placeholder="Nom"
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={formValues.lastName}
            onChange={handleChange}
          />
        </label>
      </div>

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
          value={formValues.email}
          onChange={handleChange}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-body">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Numéro de téléphone
        </span>
        <input
          className={inputClassName}
          placeholder="xx xxx xxx"
          type="tel"
          name="phone"
          autoComplete="tel"
          value={formValues.phone}
          onChange={handleChange}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-body">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
            Mot de passe
          </span>
          <div className="relative">
            <input
              className={inputClassName}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={handleChange}
            />
            <button
              className="absolute inset-y-0 right-3 flex items-center text-white/50 transition hover:text-white"
              type="button"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
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
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirm"
              autoComplete="new-password"
              value={formValues.passwordConfirm}
              onChange={handleChange}
            />
            <button
              className="absolute inset-y-0 right-3 flex items-center text-white/50 transition hover:text-white"
              type="button"
              aria-label={
                showPasswordConfirm
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              onClick={() => setShowPasswordConfirm((current) => !current)}
            >
              {showPasswordConfirm ? (
                <MdVisibilityOff className="h-5 w-5" />
              ) : (
                <MdVisibility className="h-5 w-5" />
              )}
            </button>
          </div>
        </label>
      </div>

      <label className="flex items-start gap-3 text-xs text-white/60 font-body">
        <input
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-accent/40"
          type="checkbox"
          name="terms"
          checked={formValues.terms}
          onChange={handleChange}
        />
        <span>
          J&apos;accepte les{" "}
          <Link className="text-accent underline" href="#">
            Conditions d&apos;Utilisation
          </Link>{" "}
          et la{" "}
          <Link className="text-accent underline" href="#">
            Politique de Confidentialité
          </Link>
          .
        </span>
      </label>

      {errorMessage ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent text-sm font-extrabold uppercase tracking-[0.3em] text-black shadow-[0_15px_35px_rgba(116,208,241,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "En cours..." : "S'inscrire"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
