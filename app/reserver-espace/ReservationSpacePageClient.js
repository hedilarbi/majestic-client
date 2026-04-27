"use client";

import { useMemo, useState } from "react";
import {
  RiBuildingLine,
  RiCalendarScheduleLine,
  RiCheckboxCircleLine,
  RiMailLine,
  RiMessage2Line,
  RiPhoneLine,
  RiUser3Line,
} from "react-icons/ri";

const ESTABLISHMENT_OPTIONS = [
  { value: "association", label: "Association" },
  { value: "organisation", label: "Organisation" },
];

const INPUT_CLASSES =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

const buildInitialState = () => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  establishmentType: "association",
  reservationDateTime: "",
  description: "",
});

const Field = ({ icon: Icon, label, children }) => (
  <label className="block space-y-2">
    <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
      <Icon className="h-4 w-4 text-accent" />
      {label}
    </span>
    {children}
  </label>
);

export default function ReservationSpacePageClient() {
  const [formState, setFormState] = useState(buildInitialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (!formState.firstName.trim() || !formState.lastName.trim()) {
      return "Veuillez renseigner le nom et le prénom.";
    }

    if (!formState.phone.trim()) {
      return "Veuillez renseigner le numéro de téléphone.";
    }

    if (!formState.email.trim() || !formState.email.includes("@")) {
      return "Veuillez renseigner un email valide.";
    }

    if (!formState.establishmentType) {
      return "Veuillez sélectionner un type d'établissement.";
    }

    if (!formState.reservationDateTime) {
      return "Veuillez sélectionner une date de réservation.";
    }

    if (!formState.description.trim()) {
      return "Veuillez renseigner la description de votre demande.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validate();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/space-reservation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          data?.message || "Impossible d'envoyer votre demande pour le moment.",
        );
        return;
      }

      setSuccessMessage(
        "Votre demande a bien été envoyée. Notre equipe vous recontactera prochainement.",
      );
      setFormState(buildInitialState());
    } catch (_error) {
      setErrorMessage("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(116,208,241,0.18),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.14),_transparent_32%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8 lg:py-14">
        <section className="lg:w-[38%]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_35px_80px_-50px_rgba(56,189,248,0.45)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent/80">
              Réservation d&apos;espace
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Organisez votre événement au Majestic
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
              Remplissez ce formulaire pour nous indiquer votre besoin,
              l&apos;établissement concerné et la date souhaitée. Notre équipe
              reviendra vers vous avec une proposition adaptee.
            </p>

            <div className="mt-8 space-y-4 text-sm text-white/70">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p>
                  Associations et organisations peuvent deposer une demande
                  directement depuis cette page.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <RiCalendarScheduleLine className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p>
                  Indiquez la date et l&apos;heure souhaitees pour accelerer le
                  traitement de votre dossier.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_35px_80px_-50px_rgba(15,23,42,0.85)] backdrop-blur-xl sm:p-6 lg:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field icon={RiUser3Line} label="Prénom">
                <input
                  name="firstName"
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange}
                  className={INPUT_CLASSES}
                  placeholder="Votre prénom"
                />
              </Field>

              <Field icon={RiUser3Line} label="Nom">
                <input
                  name="lastName"
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange}
                  className={INPUT_CLASSES}
                  placeholder="Votre nom"
                />
              </Field>

              <Field icon={RiPhoneLine} label="Numéro de téléphone">
                <input
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange}
                  className={INPUT_CLASSES}
                  placeholder="+216 XX XXX XXX"
                />
              </Field>

              <Field icon={RiMailLine} label="Email">
                <input
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  className={INPUT_CLASSES}
                  placeholder="nom@domaine.com"
                />
              </Field>

              <Field icon={RiBuildingLine} label="Type d'établissement">
                <select
                  name="establishmentType"
                  value={formState.establishmentType}
                  onChange={handleChange}
                  className={INPUT_CLASSES}
                >
                  {ESTABLISHMENT_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-950 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field icon={RiCalendarScheduleLine} label="Date de réservation">
                <input
                  name="reservationDateTime"
                  type="datetime-local"
                  min={minDateTime}
                  value={formState.reservationDateTime}
                  onChange={handleChange}
                  className={INPUT_CLASSES}
                />
              </Field>

              <div className="md:col-span-2">
                <Field icon={RiMessage2Line} label="Description">
                  <textarea
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    className={`${INPUT_CLASSES} min-h-40 resize-y`}
                    placeholder="Precisez le contexte, le nombre de participants, les besoins techniques, etc."
                  />
                </Field>
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {successMessage}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Envoi..." : "Envoyer la demande"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
