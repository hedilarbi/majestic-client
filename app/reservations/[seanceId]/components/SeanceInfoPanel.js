export default function SeanceInfoPanel({ seanceInfo, pricingItems, formatPrice }) {
  const availablePricingItems = Array.isArray(pricingItems)
    ? pricingItems.filter((item) => item?.isAvailable !== false)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-accent">
          Informations séance
        </h2>
        <div className="mt-6 flex gap-5">
          <div
            className="h-32 w-24 shrink-0 rounded-xl border border-white/10 bg-cover bg-center shadow-lg"
            style={{ backgroundImage: `url(${seanceInfo.poster})` }}
          />
          <div className="flex flex-col justify-center gap-3">
            <h3 className="text-2xl font-display leading-none">{seanceInfo.title}</h3>
            <div className="space-y-2 text-sm font-body text-white/60">
              {seanceInfo.date ? <p>{seanceInfo.date}</p> : null}
              {seanceInfo.time ? <p>{seanceInfo.time}</p> : null}
              {seanceInfo.room ? <p>{seanceInfo.room}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-accent">
          Tarifs disponibles
        </h3>
        <div className="mt-4 space-y-3">
          {availablePricingItems.length ? (
            availablePricingItems.map((item) => (
              <div
                key={item.id || item.name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <span className="text-sm font-body text-white/80">{item.name}</span>
                <span className="text-sm font-display text-white">
                  {formatPrice(item.price)}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-semibold text-white/60">
              Aucun tarif disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
