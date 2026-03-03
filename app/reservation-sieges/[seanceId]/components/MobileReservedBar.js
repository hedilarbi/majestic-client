export default function MobileReservedBar({
  reservedSeatLabels,
  canGoCheckout,
  onConfirm,
}) {
  if (!reservedSeatLabels.length) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-accent/30 bg-[#060911]/95 p-3 shadow-[0_10px_35px_rgba(0,0,0,0.45)] backdrop-blur lg:hidden">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
        Sieges reserves
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-white">
        {reservedSeatLabels.join(", ")}
      </p>
      <button
        type="button"
        disabled={!canGoCheckout}
        onClick={onConfirm}
        className="mt-3 flex w-full items-center justify-center rounded-xl bg-accent py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black"
      >
        Confirmer
      </button>
    </div>
  );
}
