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

export default function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

    if (!formValues.email || !formValues.password) {
      setErrorMessage("Email et mot de passe requis.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formValues.email.trim(),
          password: formValues.password,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }

      if (data?.user?.emailVerified === false) {
        router.push(
          `/verify-email?redirect=${encodeURIComponent(redirectPath)}`,
        );
        return;
      }

      router.push(redirectPath);
    } catch (error) {
      setErrorMessage(error?.message || "Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
            value={formValues.email}
            onChange={handleChange}
          />
        </label>

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
              autoComplete="current-password"
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

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/60 font-body">
          <label className="flex items-center gap-2">
            <input
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-accent/40"
              type="checkbox"
              name="remember"
              checked={formValues.remember}
              onChange={handleChange}
            />
            Se souvenir de moi
          </label>
          <Link className="text-accent underline" href="/mot-de-passe-oublie">
            Mot de passe oublie ?
          </Link>
        </div>

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
          {isSubmitting ? "Connexion..." : "Se connecter"}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-white font-body">
        <span>Vous n&apos;avez pas de compte ?</span>
        <Link
          className="text-accent underline"
          href={`/inscription?redirect=${encodeURIComponent(redirectPath)}`}
        >
          Inscrivez-vous
        </Link>
      </div>
    </>
  );
}
