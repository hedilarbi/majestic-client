import { MdCalendarMonth } from "react-icons/md";
import { getProfileSubscriptionSales } from "@/app/lib/profile-api";

const formatPrice = (value) => {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return "-";
  }
  return `${amount.toFixed(2).replace(".", ",")} DT`;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const resolveSaleState = (sale) => {
  const expiration = sale?.subscription?.expirationDate
    ? new Date(sale.subscription.expirationDate)
    : null;
  const hasExpiration = expiration && !Number.isNaN(expiration.getTime());
  const isExpiredByDate = hasExpiration && expiration.getTime() < Date.now();

  const saleExpiration = sale?.expiresAt ? new Date(sale.expiresAt) : null;
  const isSaleExpired = saleExpiration && !Number.isNaN(saleExpiration.getTime()) && saleExpiration.getTime() < Date.now();

  const isCancelled = String(sale?.status || "").toLowerCase() === "cancelled";

  if (isCancelled || isExpiredByDate || isSaleExpired) {
    return {
      label: "Expiré",
      tone: "border border-white/15 text-white/60",
      card: "bg-black/50 opacity-75",
    };
  }

  return {
    label: "Actif",
    tone: "bg-accent text-white",
    card: "bg-black/60",
  };
};

const resolveTotalCredits = (sale) => {
  const value = Number(sale?.totalCredits);
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

const resolveRemainingCredits = (sale) => {
  const total = resolveTotalCredits(sale);
  const value = Number(sale?.remainingCredits);
  if (Number.isFinite(value) && value >= 0) {
    return Math.min(value, total || value);
  }
  return total;
};

export const metadata = {
  title: "Abonnements | Majestic",
  description: "Gérez vos abonnements cinéma et vos accès premium.",
};

export default async function AbonnementsPage() {
  const { items, error } = await getProfileSubscriptionSales({ limit: 100 });
  const activeSales = [];
  const expiredSales = [];

  items.forEach((sale) => {
    const state = resolveSaleState(sale);
    if (state.label === "Actif") {
      activeSales.push({ sale, state });
    } else {
      expiredSales.push({ sale, state });
    }
  });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white font-display text-glow sm:text-5xl">
          Mes abonnements
        </h1>
        <p className="max-w-2xl text-sm text-white/50 font-body sm:text-base">
          Gérez vos accès exclusifs et vos entrées cinéma en toute simplicité.
          Profitez de l&apos;experience premium sans limite.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {activeSales.map(({ sale, state }) => (
          <article
            key={sale.id}
            className={`relative overflow-hidden rounded-2xl border border-white/10 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition hover:border-primary/50 ${state.card}`}
          >
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-accent/25 blur-[90px]" />
            <div className="relative z-10 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-white font-display">
                  {sale?.subscription?.name || "Abonnement"}
                </h2>
                {sale?.subscription?.description ? (
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/55 font-body">
                    {sale.subscription.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/40">
                  {formatPrice(sale.price)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${state.tone}`}>
                {state.label}
              </span>
            </div>

            <div className="relative z-10 mt-6 space-y-4">
              <div className="flex items-end justify-between text-sm font-body text-white/60">
                <span>Credits restants</span>
                <span className="text-2xl font-bold text-white">
                  {resolveRemainingCredits(sale)}
                  <span className="ml-1 text-base font-medium text-white/45">
                    / {resolveTotalCredits(sale)}
                  </span>
                </span>
              </div>
              <div className="h-3 w-full rounded-full border border-white/10 bg-white/5">
                <div
                  className="h-full rounded-full bg-accent shadow-[0_0_20px_rgba(16,52,166,0.5)]"
                  style={{
                    width: `${Math.max(
                      Math.min(
                        resolveTotalCredits(sale) > 0
                          ? (resolveRemainingCredits(sale) /
                              resolveTotalCredits(sale)) *
                              100
                          : 0,
                        100,
                      ),
                      0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2 border-t border-white/10 pt-6 text-sm text-white/50">
              <MdCalendarMonth className="h-4 w-4 text-white/30" />
              Achat le {formatDate(sale.createdAt)} • L'offre expire le{" "}
              {formatDate(sale?.expiresAt || sale?.subscription?.expirationDate)}
            </div>
            {sale?.subscriptionCode ? (
              <div className="relative z-10 mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Code abonnement
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-white">
                    {sale.subscriptionCode}
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(sale.subscriptionCode)}`}
                  alt={`QR ${sale.subscriptionCode}`}
                  width={80}
                  height={80}
                  className="rounded-lg bg-white p-1"
                />
              </div>
            ) : null}
          </article>
        ))}

        {expiredSales.map(({ sale, state }) => (
          <article
            key={sale.id}
            className={`relative overflow-hidden rounded-2xl border border-white/10 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition hover:opacity-100 ${state.card}`}
          >
            <div className="relative z-10 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-white font-display">
                  {sale?.subscription?.name || "Abonnement"}
                </h2>
                {sale?.subscription?.description ? (
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/55 font-body">
                    {sale.subscription.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/40">
                  {formatPrice(sale.price)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${state.tone}`}>
                {state.label}
              </span>
            </div>

            <div className="relative z-10 mt-6 space-y-4">
              <div className="flex items-end justify-between text-sm font-body text-white/60">
                <span>Credits restants</span>
                <span className="text-2xl font-bold text-white">
                  {resolveRemainingCredits(sale)}
                  <span className="ml-1 text-base font-medium text-white/45">
                    / {resolveTotalCredits(sale)}
                  </span>
                </span>
              </div>
              <div className="h-3 w-full rounded-full border border-white/10 bg-white/5">
                <div
                  className="h-full rounded-full bg-white/10"
                  style={{
                    width: `${Math.max(
                      Math.min(
                        resolveTotalCredits(sale) > 0
                          ? (resolveRemainingCredits(sale) /
                              resolveTotalCredits(sale)) *
                              100
                          : 0,
                        100,
                      ),
                      0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2 border-t border-white/10 pt-6 text-sm text-white/50">
              <MdCalendarMonth className="h-4 w-4 text-white/30" />
              Achat le {formatDate(sale.createdAt)} • L'offre expire le{" "}
              {formatDate(sale?.expiresAt || sale?.subscription?.expirationDate)}
            </div>
            {sale?.subscriptionCode ? (
              <div className="relative z-10 mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Code abonnement
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-white">
                    {sale.subscriptionCode}
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(sale.subscriptionCode)}`}
                  alt={`QR ${sale.subscriptionCode}`}
                  width={80}
                  height={80}
                  className="rounded-lg bg-white p-1"
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {!error && items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-sm text-white/60">
          Aucun abonnement trouve.
        </div>
      ) : null}
    </div>
  );
}
