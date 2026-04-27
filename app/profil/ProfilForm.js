"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MdLock } from "react-icons/md";

const inputClassName =
  "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 transition focus:border-primary focus:ring-1 focus:ring-primary/40";

const getInitials = (user) => {
  if (!user) return "MP";
  const first = user.firstName?.trim()?.[0] || "";
  const last = user.lastName?.trim()?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  if (user.email) return user.email.trim()[0]?.toUpperCase() || "MP";
  return "MP";
};

export default function ProfilForm({ user }) {
  const initialValues = useMemo(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }),
    [user],
  );

  const [formValues, setFormValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const initials = getInitials(user);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleReset = () => {
    setFormValues(initialValues);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formValues.firstName.trim(),
          lastName: formValues.lastName.trim(),
          email: formValues.email.trim(),
          phone: formValues.phone.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Erreur serveur");
      }
      setSuccessMessage("Profil mis a jour avec succès.");
    } catch (error) {
      setErrorMessage(error?.message || "Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:p-12">
      <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-4xl font-black text-white ring-4 ring-primary/20">
              {initials}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Nom
            </span>
            <input
              className={inputClassName}
              type="text"
              name="lastName"
              value={formValues.lastName}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Prénom
            </span>
            <input
              className={inputClassName}
              type="text"
              name="firstName"
              value={formValues.firstName}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Email
            </span>
            <input
              className={inputClassName}
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Numéro de téléphone
            </span>
            <input
              className={inputClassName}
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
            />
          </label>
        </div>

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

        <div className="h-px bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            className="flex items-center gap-2 text-sm font-bold text-accent transition hover:text-white"
            href="/profil/mot-de-passe"
          >
            <MdLock className="h-5 w-5" />
            Changer mon mot de passe
          </Link>
          <div className="flex w-full items-center gap-4 md:w-auto">
            <button
              className="flex-1 rounded-xl border border-white/10 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/5 md:flex-none"
              type="button"
              onClick={handleReset}
            >
              Annuler
            </button>
            <button
              className="flex-1 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-black shadow-[0_0_18px_rgba(116,208,241,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 md:flex-none"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
