import { RiAddLine, RiSubtractLine } from "react-icons/ri";

const normalizeName = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Eligibility shown under reduced prices (C13). The Enfant age range is not
// set yet, so no condition is shown for it; the < 2 years rule is displayed
// near the total.
const getPricingCondition = (name) => {
  const normalized = normalizeName(name);
  if (normalized.includes("eleve") || normalized.includes("etudiant")) {
    return "Tarif réservé aux élèves et étudiants sur présentation d’un justificatif valide.";
  }
  return "";
};

export default function PricingQuantityList({
  safePricingItems,
  quantities,
  canAdjust,
  assignedCount,
  assignableSeatsCount,
  onIncrement,
  onDecrement,
  formatPrice,
}) {
  if (!safePricingItems.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#161e22]/60 px-5 py-4 text-sm font-semibold text-white/60">
        Aucun tarif disponible.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {safePricingItems.map((item, index) => {
        const itemKey = String(item?.id ?? item?.name ?? index);
        const quantity = quantities[itemKey] || 0;
        const maxForItem = Number.isFinite(item?.variableRemainingTickets)
          ? Math.max(item.variableRemainingTickets, 0)
          : null;
        const canIncrement =
          canAdjust &&
          assignedCount < assignableSeatsCount &&
          (maxForItem === null || quantity < maxForItem);
        const canDecrement = canAdjust && quantity > 0;
        const condition = getPricingCondition(item.name);

        return (
          <div
            key={itemKey}
            className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#161e22]/60 px-5 py-4"
          >
            <div>
              <p className="text-base font-bold text-white">{item.name}</p>
              <p className="mt-1 text-sm text-white/55">{formatPrice(item.price)}</p>
              {condition ? (
                <p className="mt-1 max-w-sm text-xs leading-5 text-white/50">
                  {condition}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={!canDecrement}
                onClick={() => onDecrement(itemKey)}
                aria-label={`Retirer un billet ${item.name}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  canDecrement
                    ? "border-white/20 bg-white/5 text-white hover:border-accent hover:text-accent"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/25"
                }`}
              >
                <RiSubtractLine className="h-4 w-4" />
              </button>
              <input
                readOnly
                type="number"
                value={quantity}
                aria-label={`Nombre de billets ${item.name}`}
                className="w-7 border-none bg-transparent p-0 text-center text-xl font-bold text-white focus:outline-none"
              />
              <button
                type="button"
                disabled={!canIncrement}
                onClick={() => onIncrement(itemKey)}
                aria-label={`Ajouter un billet ${item.name}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  canIncrement
                    ? "border-accent bg-accent text-black hover:brightness-110"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/25"
                }`}
              >
                <RiAddLine className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
