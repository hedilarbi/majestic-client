import { RiVipCrown2Line } from "react-icons/ri";

export default function SubscriptionPaymentCard({
  subscriptionCodeInput,
  onSubscriptionCodeChange,
  isSubmitting,
  isSuccess,
  userRole,
  isSubscriptionPaymentRequested,
  creditsToUseWithSubscription,
}) {
  const isDisabled = isSubmitting || isSuccess || userRole !== "customer";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161e22]/70 px-5 py-4">
      <div className="flex items-center gap-2">
        <RiVipCrown2Line className="h-5 w-5 text-accent" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
          Paiement abonnement
        </p>
      </div>
      <label className="mt-3 flex flex-col gap-2">
        <input
          value={subscriptionCodeInput}
          onChange={onSubscriptionCodeChange}
          placeholder="SUB-XXXXXX-XXXXXX"
          disabled={isDisabled}
          className={`h-11 rounded-xl border px-3 text-sm text-white placeholder:text-white/35 focus:outline-none ${
            isDisabled
              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
              : "border-white/15 bg-white/5 focus:border-accent"
          }`}
        />
      </label>
      {userRole !== "customer" ? (
        <p className="mt-2 text-xs font-semibold text-white/45">
          Connectez-vous pour utiliser un abonnement.
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold text-white/45">
          1 crédit abonnement sera utilisé par siège confirmé.
        </p>
      )}
      {isSubscriptionPaymentRequested ? (
        <p className="mt-2 text-xs font-semibold text-emerald-300">
          Mode abonnement active: {creditsToUseWithSubscription} crédit
          {creditsToUseWithSubscription > 1 ? "s" : ""} seront débités si le
          code est valide.
        </p>
      ) : null}
    </div>
  );
}
