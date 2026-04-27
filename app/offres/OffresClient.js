"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MdContentCopy,
  MdLocalOffer,
  MdNightlight,
  MdStars,
} from "react-icons/md";

const formatPrice = (value) => {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return "-";
  }
  return `${amount.toFixed(2).replace(".", ",")} DT`;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const buildPromoLabel = (promoCode) => {
  if (!promoCode) {
    return "Code promo";
  }
  const reductionValue = Number.parseFloat(promoCode.reductionValue);
  if (!Number.isFinite(reductionValue)) {
    return "Code promo";
  }

  if (promoCode.reductionType === "percent") {
    return `Reduction ${reductionValue}%`;
  }

  return `Reduction ${reductionValue} DT`;
};

const buildPromoDetail = (promoCode) => {
  const expiresAt = formatDate(promoCode?.expiresAt);
  const totalUsage = Number.isFinite(promoCode?.totalUsageLimit)
    ? `Limite totale: ${promoCode.totalUsageLimit}`
    : "Limite totale: illimitee";
  const userUsage = Number.isFinite(promoCode?.userUsageLimit)
    ? `Par client: ${promoCode.userUsageLimit}`
    : "Par client: illimite";

  return `Expiré le ${expiresAt} • ${totalUsage} • ${userUsage}`;
};

export default function OffresClient({
  subscriptions = [],
  promoCodes = [],
  error = "",
}) {
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    if (!copiedCode) return undefined;
    const timeout = setTimeout(() => setCopiedCode(""), 2000);
    return () => clearTimeout(timeout);
  }, [copiedCode]);

  const handleCopy = useCallback(async (value) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(value);
    } catch (_error) {
      setCopiedCode("");
    }
  }, []);

  const subscriptionCards = useMemo(
    () =>
      (Array.isArray(subscriptions) ? subscriptions : []).map(
        (subscription, index) => ({
          key: subscription.id || `${subscription.name}-${index}`,
          checkoutId: subscription.id || "",
          title: subscription.name || "Abonnement",
          description:
            subscription.description ||
            `Abonnement ${subscription.name || ""} a ${formatPrice(subscription.price)} pour ${Number.isFinite(subscription.totalCredits) ? `${subscription.totalCredits} crédits` : "crédits illimites"}.`,
          accent: Number.isFinite(subscription.totalCredits)
            ? `${subscription.totalCredits} crédits`
            : "Premium",
          icon: index % 2 === 0 ? MdStars : MdNightlight,
          price: formatPrice(subscription.price),
          expirationDate: formatDate(subscription.expirationDate),
        }),
      ),
    [subscriptions],
  );

  const promoRows = useMemo(
    () =>
      (Array.isArray(promoCodes) ? promoCodes : []).map((promoCode) => ({
        code: promoCode.code || "",
        label: buildPromoLabel(promoCode),
        detail: buildPromoDetail(promoCode),
      })),
    [promoCodes],
  );

  return (
    <main className="relative min-h-screen w-full px-10 pb-24 pt-10 text-white sm:px-12 lg:px-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[45vh] w-[75vw] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px] opacity-70" />
        <div className="absolute bottom-0 left-0 h-[40vh] w-[50vw] rounded-full bg-accent/10 blur-[120px] opacity-60" />
      </div>

      <section className="mb-14">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 font-display">
          <MdLocalOffer className="h-4 w-4 text-accent" />
          Privileges Majestic
        </div>
        <h1 className="text-4xl font-bold uppercase tracking-tight text-white sm:text-6xl font-display text-glow">
          Offres &amp; Promos
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/60 sm:text-lg font-body">
          Decouvrez les abonnements et codes promo configurees depuis
          l&apos;administration Majestic.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="#offres"
            className="flex h-11 items-center rounded-full bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(116,208,241,0.4)] transition-all hover:brightness-110 font-display"
          >
            Voir les offres
          </Link>
          <Link
            href="#codes"
            className="flex h-11 items-center rounded-full border border-white/20 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(116,208,241,0.3)] font-display"
          >
            Codes promo
          </Link>
        </div>
      </section>

      {error ? (
        <section className="mb-10 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </section>
      ) : null}

      <section id="offres" className="mb-14">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-10 w-1 rounded-full bg-accent" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent font-display">
              Abonnements disponibles
            </p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl font-display">
              Privileges sur-mesure
            </h2>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {subscriptionCards.map((offer, index) => {
            const Icon = offer.icon;
            return (
              <article
                key={offer.key}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:bg-white/10"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-[100px] opacity-60" />
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent font-display">
                    {offer.accent}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/60">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-semibold uppercase tracking-wide text-white font-display">
                  {offer.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60 font-body">
                  {offer.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    {offer.price}
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Expiré le {offer.expirationDate}
                  </span>
                </div>
                {offer.checkoutId ? (
                  <Link
                    href={`/offres/abonnements/${offer.checkoutId}/checkout`}
                    className="mt-7 inline-flex h-11 items-center rounded-full border border-accent/50 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-all hover:bg-accent hover:text-black font-display"
                  >
                    Acheter
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
        {!subscriptionCards.length && !error ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-sm text-white/60">
            Aucun abonnement actif disponible pour le moment.
          </div>
        ) : null}
      </section>

      <section id="codes" className="mb-12">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-10 w-1 rounded-full bg-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70 font-display">
              Vos codes promo
            </p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl font-display">
              Avantages immediats
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {promoRows.map((code, index) => {
            const isCopied = copiedCode === code.code;
            return (
              <article
                key={code.code}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/60 p-6 transition-all hover:border-accent/50 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent font-display">
                    {code.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white font-display">
                    {code.code}
                  </p>
                  <p className="mt-1 text-sm text-white/40 font-body">
                    {code.detail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(code.code)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(116,208,241,0.35)] transition-all hover:brightness-110 font-display"
                  aria-live="polite"
                >
                  <MdContentCopy className="h-5 w-5" />
                  {isCopied ? "Copie" : "Copier"}
                </button>
              </article>
            );
          })}
        </div>
        {!promoRows.length && !error ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-sm text-white/60">
            Aucun code promo actif pour le moment.
          </div>
        ) : null}
      </section>
    </main>
  );
}
