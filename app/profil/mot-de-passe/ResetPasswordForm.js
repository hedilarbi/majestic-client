"use client";

import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const inputClassName =
  "h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-12 text-white placeholder:text-white/35 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const initialState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ResetPasswordForm() {
  const [formValues, setFormValues] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!formValues.oldPassword || !formValues.newPassword) {
      setErrorMessage("Tous les champs sont requis.");
      return;
    }

    if (formValues.newPassword !== formValues.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formValues.oldPassword === formValues.newPassword) {
      setErrorMessage("Le nouveau mot de passe doit etre different.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/customers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: formValues.oldPassword,
          newPassword: formValues.newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }

      setSuccessMessage(data?.message || "Mot de passe mis a jour.");
      setFormValues(initialState);
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
          Ancien mot de passe
        </span>
        <div className="relative">
          <input
            className={inputClassName}
            placeholder="••••••••"
            type={showOldPassword ? "text" : "password"}
            name="oldPassword"
            autoComplete="current-password"
            value={formValues.oldPassword}
            onChange={handleChange}
          />
          <button
            className="absolute inset-y-0 right-3 flex items-center text-white/50 transition hover:text-white"
            type="button"
            aria-label={
              showOldPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            onClick={() => setShowOldPassword((current) => !current)}
          >
            {showOldPassword ? (
              <MdVisibilityOff className="h-5 w-5" />
            ) : (
              <MdVisibility className="h-5 w-5" />
            )}
          </button>
        </div>
      </label>

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
        {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
