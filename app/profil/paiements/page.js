import {
  MdAccountBalance,
  MdAccountBalanceWallet,
  MdChevronLeft,
  MdChevronRight,
  MdCreditCard,
  MdDownload,
  MdFilterList,
  MdReceiptLong,
} from "react-icons/md";
import { getProfilePayments } from "@/app/lib/profile-api";

const formatAmount = (value) => {
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
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const formatPaymentMethod = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "online") return "Paiement en ligne";
  if (normalized === "cash") return "Especes";
  if (normalized === "card") return "Carte";
  if (normalized === "subscription") return "Abonnement";
  return value || "-";
};

export const metadata = {
  title: "Paiements | Majestic",
  description: "Historique des paiements et transactions.",
};

const renderIcon = (name) => {
  switch (name) {
    case "account_balance":
      return MdAccountBalance;
    case "account_balance_wallet":
      return MdAccountBalanceWallet;
    default:
      return MdCreditCard;
  }
};

export default async function PaiementsPage() {
  const { items, total, error } = await getProfilePayments({ limit: 200 });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white font-display text-glow md:text-4xl">
            Historique des paiements
          </h1>
          <p className="max-w-xl text-sm text-white/50 font-body">
            Consultez et gerez l&apos;ensemble de vos transactions recentes.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            <MdFilterList className="h-5 w-5 text-accent" />
            Filtrer
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(116,208,241,0.4)] transition hover:brightness-110">
            <MdDownload className="h-5 w-5" />
            Rapport PDF
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-primary/10 text-xs font-bold uppercase tracking-wider text-white/70">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Libelle</th>
                <th className="px-6 py-5">Montant</th>
                <th className="px-6 py-5">Mode</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((row, index) => {
                const method = String(row?.paymentMethod || "").toLowerCase();
                const iconName =
                  method === "cash"
                    ? "account_balance"
                    : method === "card"
                      ? "credit_card"
                      : method === "subscription"
                        ? "account_balance_wallet"
                        : "credit_card";
                const PaymentIcon = renderIcon(iconName);

                return (
                  <tr
                    key={`${row.id || row.transactionId || row.title}-${index}`}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-6 text-sm text-white/70">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {row.title || "-"}
                        </span>
                        <span className="text-xs text-white/30">
                          {row.subtitle || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-white italic">
                      {formatAmount(row.amount)}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <PaymentIcon className="h-5 w-5 text-white/60" />
                        </div>
                        {formatPaymentMethod(row.paymentMethod)}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button
                        type="button"
                        className="flex items-center justify-end gap-1 text-xs font-bold uppercase text-accent transition hover:text-white"
                      >
                        <MdReceiptLong className="h-4 w-4" />
                        {row.reference || "Reference"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && !error ? (
                <tr>
                  <td
                    className="px-6 py-8 text-sm text-white/60"
                    colSpan={5}
                  >
                    Aucune transaction pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-6 py-4 text-xs text-white/40">
          <p>
            Affichage de {items.length} transaction
            {items.length > 1 ? "s" : ""} sur {total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40"
            >
              <MdChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-black shadow-[0_0_10px_rgba(116,208,241,0.4)]"
            >
              1
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/5"
            >
              <MdChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
