import { RiCloseLine } from "react-icons/ri";

export default function FixedSeatInfoModal({ seatInfo, onClose }) {
  if (!seatInfo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
        aria-label="Fermer le message de tarif fixe"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-accent/40 bg-[#0d121c] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Siège a tarif fixe
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Siège {seatInfo.seatLabel}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 p-2 text-white/70 transition hover:border-accent hover:text-accent"
            aria-label="Fermer"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-white/75">
          Ce siège utilise un tarif fixe. Vous ne pourrez pas changer son tarif à
          l&apos;etape suivante.
        </p>

        <div className="mt-5 rounded-xl border border-accent/35 bg-accent/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/85">
            Tarif applique
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {seatInfo.pricingName}
          </p>
          <p className="mt-1 text-sm text-white/80">{seatInfo.pricingPriceLabel}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black transition hover:brightness-110"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
