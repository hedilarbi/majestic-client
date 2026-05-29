"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiCloseLine,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiVipCrown2Line,
} from "react-icons/ri";

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

const resolveRedirectPath = (value, fallback = "/profil/abonnements") => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  return trimmed;
};

export default function SubscriptionCheckoutClient({
  subscriptionId,
  subscription,
  initialError = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoFinalizeAttemptedRef = useRef(false);
  const [userRole, setUserRole] = useState("guest");
  const [userEmailVerified, setUserEmailVerified] = useState(null);
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const verificationRedirectPath = resolveRedirectPath(
    `/offres/abonnements/${subscriptionId}/checkout?autofinalize=1`,
    "/profil/abonnements",
  );
  const redirectToVerifyEmail = useCallback(
    (replace = false) => {
      const target = `/verify-email?redirect=${encodeURIComponent(
        verificationRedirectPath,
      )}&send=1&info=${encodeURIComponent(
        "Un nouveau code OTP vous sera envoyé pour finaliser votre achat.",
      )}`;

      if (replace) {
        router.replace(target);
        return;
      }

      router.push(target);
    },
    [router, verificationRedirectPath],
  );

  const isSubmitting = submitState.status === "loading";
  const requiresEmailVerification =
    userRole === "customer" && userEmailVerified === false;
  const canContinue = Boolean(subscription) && !initialError && !isSubmitting;

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (!active) {
          return;
        }
        const role = data?.user?.role ? String(data.user.role) : "guest";
        setUserRole(role);
        setUserEmailVerified(
          typeof data?.user?.emailVerified === "boolean"
            ? data.user.emailVerified
            : null,
        );
      } catch (_error) {
        // noop
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const finalizePurchase = useCallback(
    async ({ silent = false } = {}) => {
      if (!subscriptionId || !subscription || isSubmitting) {
        return false;
      }

      setSubmitState({
        status: "loading",
        message: "Paiement en cours (simulation)...",
      });

      try {
        const response = await fetch("/api/subscription-sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId,
            paymentMethod: "online",
            source: "web",
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.message || "Impossible de finaliser l'achat.";
          if (
            response.status === 403 &&
            typeof message === "string" &&
            message.toLowerCase().includes("vérifier votre adresse email")
          ) {
            setSubmitState({ status: "idle", message: "" });
            redirectToVerifyEmail();
            return false;
          }
          throw new Error(message);
        }

        if (data?.paymentFormUrl) {
          window.location.href = data.paymentFormUrl;
          return true;
        }

        setSubmitState({
          status: "success",
          message: "Abonnement active avec succès.",
        });

        const saleId =
          data?.sale?.id || data?.sale?._id
            ? String(data.sale.id || data.sale._id)
            : "";
        const saleIdQuery = saleId
          ? `?saleId=${encodeURIComponent(saleId)}`
          : "";
        router.replace(
          `/offres/abonnements/${subscriptionId}/checkout/succes${saleIdQuery}`,
        );
        return true;
      } catch (error) {
        const message = error?.message || "Impossible de finaliser l'achat.";
        setSubmitState({ status: "error", message });
        if (!silent) {
          return false;
        }
        return false;
      }
    },
    [
      isSubmitting,
      redirectToVerifyEmail,
      router,
      subscription,
      subscriptionId,
    ],
  );

  const handleContinue = useCallback(async () => {
    if (!canContinue) {
      return;
    }

    if (userRole !== "customer") {
      setIsAuthModalOpen(true);
      return;
    }

    if (requiresEmailVerification) {
      redirectToVerifyEmail();
      return;
    }

    await finalizePurchase();
  }, [
    canContinue,
    finalizePurchase,
    redirectToVerifyEmail,
    requiresEmailVerification,
    userRole,
  ]);

  const handleOpenLogin = useCallback(
    (target) => {
      const redirectTarget = resolveRedirectPath(
        `/offres/abonnements/${subscriptionId}/checkout?autofinalize=1`,
      );
      const pathname = target === "signup" ? "/inscription" : "/connexion";
      router.push(`${pathname}?redirect=${encodeURIComponent(redirectTarget)}`);
    },
    [router, subscriptionId],
  );

  useEffect(() => {
    if (userRole !== "customer") {
      return;
    }

    if (userEmailVerified === false) {
      if (!autoFinalizeAttemptedRef.current) {
        autoFinalizeAttemptedRef.current = true;
      }
      redirectToVerifyEmail(true);
      return;
    }

    if (userEmailVerified !== true) {
      return;
    }

    const shouldAutoFinalize = searchParams?.get("autofinalize") === "1";
    if (!shouldAutoFinalize || autoFinalizeAttemptedRef.current) {
      return;
    }

    autoFinalizeAttemptedRef.current = true;
    finalizePurchase({ silent: true });
  }, [finalizePurchase, redirectToVerifyEmail, searchParams, userEmailVerified, userRole]);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-8 text-white md:px-10 md:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[40vh] w-[70vw] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px] opacity-70" />
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <Link
            href="/offres"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-accent/70 hover:text-accent"
            aria-label="Retour aux offres"
          >
            <RiArrowLeftSLine className="h-5 w-5" />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Checkout abonnement
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              Finaliser votre abonnement
            </h1>
            <p className="mt-3 text-sm text-white/60 md:text-base">
              Le paiement sera intégré plus tard. Pour le moment, la validation
              créé directement votre abonnement actif.
            </p>
          </div>

          {initialError ? (
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-200">
              {initialError}
            </div>
          ) : null}

          {submitState.status === "error" ? (
            <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-200">
              {submitState.message}
            </div>
          ) : null}

          {requiresEmailVerification ? (
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-100">
              Votre compte n&apos;est pas encore vérifié. Vérifiez votre adresse
              email pour acheter cet abonnement.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <RiVipCrown2Line className="h-5 w-5 text-accent" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Abonnement
                </p>
              </div>
              <h2 className="text-2xl font-black text-white">
                {subscription?.name || "Abonnement"}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {subscription?.description || "Offre premium Majestic."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/20 px-3 py-1">
                  {Number.isFinite(subscription?.totalCredits)
                    ? `${subscription.totalCredits} crédits`
                    : "Credits"}
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  Expiré le {formatDate(subscription?.expirationDate)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-accent/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/80">
                Total a payer
              </p>
              <p className="mt-2 text-4xl font-black text-white">
                {formatPrice(subscription?.price)}
              </p>
              <div className="mt-5 rounded-xl border border-white/15 bg-black/25 p-3 text-xs text-white/70">
                <div className="mt-2 flex items-center gap-2">
                  <RiPriceTag3Line className="h-4 w-4 text-accent" />
                  L&apos;abonnement sera rattache a votre compte apres
                  confirmation
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/offres"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-accent hover:text-accent"
            >
              Annuler
            </Link>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-xs font-bold uppercase tracking-[0.2em] transition ${
                canContinue
                  ? "bg-accent text-black hover:brightness-110"
                  : "cursor-not-allowed bg-white/10 text-white/35"
              }`}
            >
              {isSubmitting ? "Traitement..." : "Continuer vers le paiement"}
              <RiArrowRightLine className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isAuthModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6">
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111820] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80"
              aria-label="Fermer la fenêtre"
            >
              <RiCloseLine className="h-4 w-4" />
            </button>
            <h3 className="text-xl font-semibold text-white">
              Connectez-vous pour continuer
            </h3>
            <p className="mt-2 text-sm text-white/65">
              L&apos;achat d&apos;abonnement necessite un compte client.
            </p>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => handleOpenLogin("login")}
                className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => handleOpenLogin("signup")}
                className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
