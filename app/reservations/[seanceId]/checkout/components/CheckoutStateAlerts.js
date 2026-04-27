export default function CheckoutStateAlerts({
  isLoading,
  errorMessage,
  reservation: reservation,
  expiredReservationMessage
}) {
  return (
    <>
      {isLoading ?
      <div className="rounded-2xl border border-white/10 bg-[#161e22]/80 px-5 py-4 text-sm font-semibold text-white/70">
          Chargement du récapitulatif...
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