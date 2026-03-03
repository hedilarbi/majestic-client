import { RiArrowRightLine } from "react-icons/ri";

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
            Total a payer
          </p>
          <p className="text-2xl font-semibold text-white">{formatPrice(payableTotal)}</p>
          {isSubscriptionPaymentRequested ? (
            <p className="mt-1 text-xs font-semibold text-white/45 line-through">
              Montant hors abonnement: {formatPrice(totalPrice)}
            </p>
          ) : isPromoApplied ? (
            <>
              <p className="mt-1 text-xs font-semibold text-white/45 line-through">
                Montant initial: {formatPrice(totalPrice)}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-300">
                Reduction promo: -{formatPrice(promoDiscountAmount)}
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
          {isSubmitting ? "Finalisation..." : "Continuer vers le paiement"}
          <RiArrowRightLine className="h-4 w-4" />
        </button>
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
            ? ` Numero: ${submitState.booking.bookingNumber}.`
            : ""}
        </div>
      ) : null}
    </div>
  );
}
