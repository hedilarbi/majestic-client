"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { RiArrowRightLine, RiCheckboxCircleLine, RiSendPlaneLine } from "react-icons/ri";

import { formatActualiteDate, getActualiteSummary } from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";
import ActualiteFormQuestionField from "./ActualiteFormQuestionField";

const normalizeAnswersForReset = (questions = []) =>
  questions.reduce((accumulator, question) => {
    accumulator[question.id] = question.type === "checkbox" ? [] : "";
    return accumulator;
  }, {});

export default function ActualiteFormCard({
  item,
  currentUser,
  redirectPath = "/actualite",
}) {
  const router = useRouter();
  const initialAnswers = useMemo(
    () => normalizeAnswersForReset(item?.questions),
    [item?.questions],
  );
  const [answers, setAnswers] = useState(initialAnswers);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = currentUser?.role === "customer";
  const customerName = [currentUser?.firstName, currentUser?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const handleFieldChange = (questionId, nextValue, isCheckbox = false) => {
    setAnswers((current) => {
      if (isCheckbox) {
        const currentValues = Array.isArray(current[questionId])
          ? current[questionId]
          : [];
        const nextValues = currentValues.includes(nextValue)
          ? currentValues.filter((value) => value !== nextValue)
          : [...currentValues, nextValue];

        return {
          ...current,
          [questionId]: nextValues,
        };
      }

      return {
        ...current,
        [questionId]: nextValue,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push(`/connexion?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/actualites/forms/${encodeURIComponent(item.id)}/submissions`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/connexion?redirect=${encodeURIComponent(redirectPath)}`);
          return;
        }

        throw new Error(
          data?.message || "Le formulaire n'a pas pu être envoyé.",
        );
      }

      setAnswers(normalizeAnswersForReset(item?.questions));
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error?.message || "Le formulaire n'a pas pu être envoyé.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <article className="rounded-[2rem] border border-emerald-500/25 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <RiCheckboxCircleLine className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white font-display">Réponse envoyée !</h2>
        <p className="mt-3 text-sm leading-7 text-white/60">
          Votre réponse a bien été enregistrée. Merci pour votre participation.
        </p>
        <Link
          href="/actualite"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-accent transition hover:brightness-110"
        >
          Retour aux actualités
          <RiArrowRightLine className="h-4 w-4" />
        </Link>
      </article>
    );
  }

  const coverImage = item.image || "";

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      {coverImage ? (
        <div className="relative h-56 w-full sm:h-72 lg:h-96 bg-black/40">
          <Image
            src={coverImage}
            alt={item.title || "Formulaire"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      ) : null}

      <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <ActualiteTypeBadge type={item.type} />
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
          {formatActualiteDate(item.createdAt)}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl font-display">
        {item.title}
      </h2>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
        {getActualiteSummary(item)}
      </p>

      <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/65">
        {isAuthenticated ? (
          <span>
            Connecté en tant que{" "}
            <span className="font-semibold text-white">
              {customerName || currentUser?.email || "Client"}
            </span>
          </span>
        ) : (
          <span>
            Seuls les utilisateurs connectés peuvent postuler.{" "}
            <Link
              href={`/connexion?redirect=${encodeURIComponent(redirectPath)}`}
              className="inline-flex items-center gap-1 font-semibold text-accent underline"
            >
              Se connecter
              <RiArrowRightLine className="h-4 w-4" />
            </Link>
          </span>
        )}
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {Array.isArray(item.questions)
          ? item.questions.map((question) => (
              <ActualiteFormQuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(nextValue, isCheckbox) =>
                  handleFieldChange(question.id, nextValue, isCheckbox)
                }
              />
            ))
          : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RiSendPlaneLine className="h-4 w-4" />
          {isSubmitting ? "Envoi..." : "Envoyer le formulaire"}
        </button>
      </form>
      </div>
    </article>
  );
}
