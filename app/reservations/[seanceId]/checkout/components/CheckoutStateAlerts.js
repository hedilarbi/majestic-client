export default function CheckoutStateAlerts({
  isLoading,
  errorMessage,
  reservation: reservation,
  expiredReservationMessage,
  isPaymentFailed = false
}) {
  return (
    <>
      {isLoading ?
      <div className="rounded-2xl border border-white/10 bg-[#161e22]/80 px-5 py-4 text-sm font-semibold text-white/70">
          Chargement du récapitulatif...
        </div> :
      null}

      {isPaymentFailed && reservation ?
      <div
        role="alert"
        className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-200">
          Le paiement n&apos;a pas abouti et aucun montant n&apos;a été validé.
          Vos places restent réservées jusqu&apos;à 20 minutes après votre
          tentative de paiement : vous pouvez réessayer, par exemple avec une
          autre carte.
        </div> :
      null}

      {!isLoading && errorMessage ?
      <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-200">
          {errorMessage}
        </div> :
      null}

      {!isLoading && !errorMessage && !reservation ?
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-200">
          {expiredReservationMessage || "Aucune réservation active pour cette séance."}
        </div> :
      null}
    </>);

}