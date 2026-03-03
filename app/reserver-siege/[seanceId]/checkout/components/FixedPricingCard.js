export default function FixedPricingCard({ fixedPricingGroups, formatPrice }) {
  if (!fixedPricingGroups.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161e22]/70 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
        Tarifs fixes (imposes)
      </p>
      <div className="mt-4 space-y-3">
        {fixedPricingGroups.map((group) => (
          <div
            key={group.key}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{group.label}</span>
              <span className="text-sm font-semibold text-white">
                {formatPrice(group.price)}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white/50">
              Sieges: {group.seats.join(", ")}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold text-white/45">
        Ces sieges ont un tarif fixe et ne peuvent pas etre modifies.
      </p>
    </div>
  );
}
