import Image from "next/image";
import { getProfileTickets } from "@/app/lib/profile-api";
import {
  MdCalendarMonth,
  MdEventSeat,
  MdHelpOutline,
  MdSchedule,
  MdTheaterComedy,
  MdConfirmationNumber,
  MdDownload,
} from "react-icons/md";

const FALLBACK_POSTER = "/images/logo.png";

const formatSeatLabel = (seat) => {
  if (!seat || seat.row === undefined || seat.col === undefined) {
    return "-";
  }
  return `${seat.row}${seat.col}`;
};

const resolveSessionDateTime = (ticket) => {
  const dateValue = ticket?.session?.date;
  if (!dateValue) {
    return null;
  }

  const raw = new Date(dateValue);
  if (Number.isNaN(raw.getTime())) {
    return null;
  }

  const [hours = "00", minutes = "00"] = String(
    ticket?.session?.sessionTime || "00:00",
  ).split(":");

  raw.setHours(Number.parseInt(hours, 10) || 0);
  raw.setMinutes(Number.parseInt(minutes, 10) || 0);
  raw.setSeconds(0);
  raw.setMilliseconds(0);
  return raw;
};

const formatSessionDate = (ticket) => {
  const value = resolveSessionDateTime(ticket);
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(value);
};

const formatSessionTime = (ticket) => {
  const raw = String(ticket?.session?.sessionTime || "").trim();
  return raw || "-";
};

const resolveRoom = (ticket) =>
  ticket?.session?.roomId ? `Salle ${ticket.session.roomId}` : "Salle";

const resolveTicketPdfHref = (ticket) => {
  const id = String(ticket?.id || "").trim();
  if (!id) {
    return "";
  }
  return `/api/users/me/tickets/${encodeURIComponent(id)}/pdf`;
};

export const metadata = {
  title: "Mes billets | Majestic",
  description: "Gerez vos réservations et vos codes d'accés.",
};

export default async function BilletsPage() {
  const { items, error } = await getProfileTickets({ limit: 200 });
  const now = new Date();

  const upcomingTickets = items.filter((ticket) => {
    const date = resolveSessionDateTime(ticket);
    return date && date.getTime() >= now.getTime();
  });

  const pastTickets = items.filter((ticket) => {
    const date = resolveSessionDateTime(ticket);
    return !date || date.getTime() < now.getTime();
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display text-glow">
            Mes billets
          </h1>
          <p className="mt-2 text-sm text-white/50 font-body sm:text-base">
            Gerez vos reservations et accedez a vos codes d&apos;acces.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
          <MdHelpOutline className="h-5 w-5 text-accent" />
          Aide ?
        </button>
      </header>

      <div className="flex gap-8 border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-wide">
        <div className="border-b-2 border-primary pb-3 text-white">
          A venir ({upcomingTickets.length})
        </div>
        <div className="border-b-2 border-transparent pb-3 text-white/40">
          Passes ({pastTickets.length})
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {upcomingTickets.map((ticket) => (
          <article
            key={ticket.id || ticket.code}
            className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative h-64 w-full md:h-auto md:w-48">
                <Image
                  src={ticket?.session?.event?.poster || FALLBACK_POSTER}
                  alt={ticket?.session?.event?.name || "Ticket"}
                  fill
                  sizes="(min-width: 768px) 12rem, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden" />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="rounded bg-primary/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                      Ticket
                    </span>
                    <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                      {ticket?.session?.event?.name || "Seance"}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <MdCalendarMonth className="h-5 w-5 text-accent" />
                        {formatSessionDate(ticket)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MdSchedule className="h-5 w-5 text-accent" />
                        {formatSessionTime(ticket)}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <MdTheaterComedy className="h-5 w-5 text-accent" />
                        {resolveRoom(ticket)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MdEventSeat className="h-5 w-5 text-accent" />
                        Siege {formatSeatLabel(ticket.seat)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                      <MdConfirmationNumber className="h-4 w-4 text-accent" />
                      {ticket?.booking?.bookingNumber || ticket?.code || "-"}
                    </div>
                  </div>
                  <div className="hidden sm:flex min-h-28 min-w-28 flex-col items-center justify-center rounded-xl bg-white p-2 text-slate-900 shadow-lg">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {ticket.code || "-"}
                    </span>
                    <span className="mt-1 text-[9px] font-semibold text-slate-500">
                      {formatSeatLabel(ticket.seat)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-white">
                    Tarif {ticket.pricingName || "-"} •{" "}
                    {Number.isFinite(ticket.price) ? `${ticket.price} DT` : "-"}
                  </div>
                  {resolveTicketPdfHref(ticket) ? (
                    <a
                      href={resolveTicketPdfHref(ticket)}
                      download
                      className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/25"
                    >
                      <MdDownload className="h-5 w-5 text-accent" />
                      Telecharger mon billet
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}

        {upcomingTickets.length === 0 && !error ? (
          <div className="rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-sm text-white/60">
            Aucun billet a venir.
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-4 opacity-60">
          <h2 className="text-lg font-bold text-white">Seances passees</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {pastTickets.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/55">
            Aucun billet passe.
          </div>
        ) : (
          pastTickets.slice(0, 12).map((ticket) => (
            <article
              key={`past-${ticket.id || ticket.code}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/50 opacity-80 md:flex-row"
            >
              <div className="relative h-32 w-full md:h-auto md:w-32">
                <Image
                  src={ticket?.session?.event?.poster || FALLBACK_POSTER}
                  alt={ticket?.session?.event?.name || "Seance"}
                  fill
                  sizes="8rem"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 items-center justify-between gap-4 p-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {ticket?.session?.event?.name || "Seance"}
                  </h3>
                  <p className="mt-2 text-sm text-white/50">
                    {formatSessionDate(ticket)} • {resolveRoom(ticket)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70">
                  {ticket.code || "-"}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
