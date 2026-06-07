import Link from "next/link";
import {
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiPriceTag3Line,
  RiQrCodeLine,
  RiTicket2Line,
  RiVipCrown2Line,
} from "react-icons/ri";

import { getProfileSubscriptionSaleById } from "@/app/lib/profile-api";

export const metadata = {
  title: "Paiement réussi | Abonnement Majestic",
  description: "Confirmation de votre achat d'abonnement et détails de la vente.",
};

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const formatPaymentMethod = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "online") return "Paiement en ligne";
  if (normalized === "cash") return "Especes";
  if (normalized === "card") return "Carte";
  return value || "-";
};

const buildSubscriptionQrSrc = (code) => {
  const value = typeof code === "string" ? code.trim() : "";
  if (!value) {
    return "";
  }

  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;
};

export default async function SubscriptionCheckoutSuccessPage({
  params,
  searchParams,
}) {
  const resolvedParams = (await params) || {};
  const resolvedSearchParams = (await searchParams) || {};
  const subscriptionId = resolvedParams.subscriptionId || "";
  const saleId =
    typeof resolvedSearchParams.saleId === "string"
      ? resolvedSearchParams.saleId
      : "";

  const { sale, error } = await getProfileSubscriptionSaleById(saleId);
  const subscription = sale?.subscription || null;
  const totalCredits = Number.isFinite(sale?.totalCredits) ? sale.totalCredits : 0;
  const remainingCredits = Number.isFinite(sale?.remainingCredits)
    ? sale.remainingCredits
    : totalCredits;
  const subscriptionQrSrc = buildSubscriptionQrSrc(sale?.subscriptionCode);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <section className="rounded-3xl border border-white/10 bg-[#111820]/90 p-6 shadow-[0_35px_110px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
            <RiCheckboxCircleLine className="h-9 w-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Paiement réussi
          </h1>
          <p className="mt-2 text-sm text-white/65 md:text-base">
            Votre abonnement est actif. Conservez le code pour l&apos;utiliser au
            checkout des billets.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            {error}
          </div>
        ) : null}

        {!error && !sale ? (
          <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
            Impossible de récupérer les détails de la vente.
          </div>
        ) : null}

        {sale ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-accent">
                <RiVipCrown2Line className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Abonnement
                </p>
              </div>
              <p className="text-xl font-bold text-white">
                {subscription?.name || "Abonnement"}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {subscription?.description || "Offre abonnement Majestic"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/20 px-3 py-1">
                  {remainingCredits} / {totalCredits} crédits
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  Expiré le {formatDate(subscription?.expirationDate)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-accent">
                <RiQrCodeLine className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Code abonnement
                </p>
              </div>
              <p className="break-all rounded-xl border border-white/15 bg-black/25 px-3 py-2 font-mono text-sm font-bold text-white">
                {sale.subscriptionCode || "-"}
              </p>
              {subscriptionQrSrc ? (
                <div className="mt-4 flex justify-center rounded-2xl border border-white/10 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={subscriptionQrSrc}
                    alt={`QR abonnement ${sale.subscriptionCode}`}
                    width={148}
                    height={148}
                    className="h-[148px] w-[148px] object-contain"
                  />
                </div>
              ) : null}
              <div className="mt-4 space-y-2 text-sm text-white/75">
                <p className="flex items-center gap-2">
                  <RiPriceTag3Line className="h-4 w-4 text-accent" />
                  Montant: {formatPrice(sale.price)}
                </p>
                <p className="flex items-center gap-2">
                  <RiTicket2Line className="h-4 w-4 text-accent" />
                  Paiement: {formatPaymentMethod(sale.paymentMethod)}
                </p>
                <p className="flex items-center gap-2">
                  <RiCalendarLine className="h-4 w-4 text-accent" />
                  Date: {formatDate(sale.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/profil/abonnements"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:brightness-110"
          >
            Voir mes abonnements
          </Link>
          <Link
            href={`/offres/abonnements/${subscriptionId}/checkout`}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-accent hover:text-accent"
          >
            Retour checkout
          </Link>
        </div>
      </section>
    </main>
  );
}
