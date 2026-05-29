import { RiPriceTag3Line } from "react-icons/ri";
import PromoCodeSuggestions from "./PromoCodeSuggestions";

export default function PromoCodeCard({
  promoCodeInput,
  onPromoCodeChange,
  isSubmitting,
  isSuccess,
  isSubscriptionPaymentRequested,
  onValidatePromo,
  onCancelPromo,
  canValidatePromo,
  promoState,
  isPromoApplied,
  appliedPromoCode,
  promoReductionLabel,
  promoDiscountAmount,
  formatPrice,
  userRole,
}) {
  const isAuthenticated = userRole === "customer";

  const handleSelectSuggestion = (code) => {
    if (isSubmitting || isSuccess || isSubscriptionPaymentRequested) return;
    onPromoCodeChange({ target: { value: code } });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161e22]/70 px-5 py-4">
      <div className="flex items-center gap-2">
        <RiPriceTag3Line className="h-5 w-5 text-accent" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
          Code promo
        </p>
      </div>
      <label className="mt-3 flex flex-col gap-2">
        <input
          value={promoCodeInput}
          onChange={onPromoCodeChange}
          placeholder="PROMO2026"
          disabled={isSubmitting || isSuccess || isSubscriptionPaymentRequested}
          className={`h-11 rounded-xl border px-3 text-sm text-white placeholder:text-white/35 focus:outline-none ${
            isSubmitting || isSuccess || isSubscriptionPaymentRequested
              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
              : "border-white/15 bg-white/5 focus:border-accent"
          }`}
        />
      </label>
      {!isPromoApplied && !isSubscriptionPaymentRequested ? (
        <PromoCodeSuggestions
          onSelect={handleSelectSuggestion}
          isAuthenticated={isAuthenticated}
        />
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onValidatePromo}
          disabled={!canValidatePromo || promoState.status === "loading"}
          className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-xs font-bold uppercase tracking-[0.16em] transition ${
            canValidatePromo && promoState.status !== "loading"
              ? "bg-accent text-black hover:brightness-110"
              : "cursor-not-allowed bg-white/10 text-white/35"
          }`}
        >
          {promoState.status === "loading" ? "Validation..." : "Valider"}
        </button>
        <button
          type="button"
          onClick={onCancelPromo}
          disabled={isSubmitting || isSuccess}
          className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition ${
            isSubmitting || isSuccess
              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
              : "border-white/20 bg-white/5 text-white/80 hover:border-accent hover:text-accent"
          }`}
        >
          Annuler
        </button>
      </div>
      {isPromoApplied ? (
        <p className="mt-3 text-xs font-semibold text-emerald-300">
          Code applique: {appliedPromoCode} ({promoReductionLabel}) - reduction{" "}
          {formatPrice(promoDiscountAmount)}.
        </p>
      ) : null}
      {!isPromoApplied && promoState.message ? (
        <p
          className={`mt-3 text-xs font-semibold ${
            promoState.status === "error" ? "text-rose-200" : "text-white/55"
          }`}
        >
          {promoState.message}
        </p>
      ) : null}
      {isSubscriptionPaymentRequested ? (
        <p className="mt-2 text-xs font-semibold text-white/45">
          Code promo indisponible en paiement abonnement.
        </p>
      ) : null}
    </div>
  );
}
