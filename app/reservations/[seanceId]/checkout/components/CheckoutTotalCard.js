import Link from "next/link";
import { RiArrowRightLine, RiInformationLine } from "react-icons/ri";

export default function CheckoutTotalCard({
  payableTotal,
  isSubscriptionPaymentRequested,
  totalPrice,
  isPromoApplied,
  promoDiscountAmount,
  canContinue,
  isSubmitting,
  onContinue,
  submitState,
  formatPrice,
}) {
  return (
    <div className="mt-2 rounded-2xl border border-accent/30 bg-[#161e22] p-6">
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
            Total à payer
          </p>
          <p className="text-2xl font-semibold text-white">{formatPrice(payableTotal)}</p>
          {isSubscriptionPaymentRequested ? (
            <p className="mt-1 text-xs font-semibold text-white/45 line-through">
              Montant hors abonnement : {formatPrice(totalPrice)}
            </p>
          ) : isPromoApplied ? (
            <>
              <p className="mt-1 text-xs font-semibold text-white/45 line-through">
                Montant initial : {formatPrice(totalPrice)}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-300">
                Réduction promo : -{formatPrice(promoDiscountAmount)}
              </p>
            </>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] transition md:w-auto ${
            canContinue
              ? "bg-accent text-black hover:brightness-110"
              : "cursor-not-allowed bg-white/10 text-white/35"
          }`}
        >
          {isSubmitting
            ? "Finalisation..."
            : isSubscriptionPaymentRequested
            ? "Confirmer"
            : "Continuer vers le paiement"}
          <RiArrowRightLine className="h-4 w-4" />
        </button>
      </div>

      {/* Admission rules shown before payment (C12) */}
      <div className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-white/60">
        <RiInformationLine className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Chaque billet donne accès à une seule personne. Les enfants de moins
          de 2 ans ne sont pas admis. Consultez les conditions propres à la
          séance et aux tarifs sélectionnés.{" "}
          <Link
            href="/conditions-utilisation"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            Conditions d&apos;utilisation et de réservation
          </Link>
        </p>
      </div>

      {submitState.status === "error" ? (
        <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
          {submitState.message || "Une erreur est survenue."}
        </div>
      ) : null}

      {submitState.status === "success" ? (
        <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
          {submitState.message}
          {submitState.booking?.bookingNumber
            ? ` Référence : ${submitState.booking.bookingNumber}.`
            : ""}
        </div>
      ) : null}
    </div>
  );
}
