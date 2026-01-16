import Link from "next/link";
import { notFound } from "next/navigation";
import EventTrailer from "../../components/EventTrailer";
import SessionSelector from "../../components/SessionSelector";
import { getEventSessions } from "../../lib/event-api";
import { MdInfoOutline, MdSchedule } from "react-icons/md";

const FALLBACK_SYNOPSIS = "Synopsis à venir.";

const formatDuration = (minutes) => {
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedMinutes)) return "";
  const hours = Math.floor(parsedMinutes / 60);
  const remainingMinutes = parsedMinutes % 60;
  if (hours <= 0) return `${parsedMinutes}min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};

const formatAgeRestriction = (value) => {
  if (!value && value !== 0) return "";
  const label = String(value).trim();
  if (!label) return "";
  if (label.startsWith("-") || label.startsWith("+")) return label;
  return `-${label}`;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const isWithinAvailability = (fromDate, toDate) => {
  if (!fromDate && !toDate) return true;
  const now = new Date();
  if (fromDate && now < fromDate) return false;
  if (toDate && now > toDate) return false;
  return true;
};

export default async function EvenementPage({ params }) {
  const { id } = await params;
  const { event, sessions } = await getEventSessions(id);

  if (!event) {
    notFound();
  }

  const durationLabel = formatDuration(event.duration);
  const ageRestrictionLabel = formatAgeRestriction(event.ageRestriction);
  const genreLabel =
    event.genres?.[0] || (event.type === "show" ? "Spectacle" : "Film");
  const synopsis = event.description || FALLBACK_SYNOPSIS;
  const directorLabel = event.directedBy || "À confirmer";
  const castLabel = event.cast?.length ? event.cast.join(", ") : "À confirmer";
  const trailerLink = event.trailerLink || "";
  const availableFromDate = parseDateValue(event.availableFrom);
  const availableToDate = parseDateValue(event.availableTo);
  const isAvailableNow = isWithinAvailability(
    availableFromDate,
    availableToDate
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full border-b border-white/5 bg-black/70">
        <div className="mx-auto px-10 py-3 sm:px-12 lg:px-20">
          <nav
            aria-label="Fil d'ariane"
            className="flex flex-wrap gap-2 text-sm font-body"
          >
            <Link
              className="text-accent transition-colors hover:text-white"
              href="/"
            >
              Accueil
            </Link>
            <span className="text-white/30">/</span>
            <Link
              className="text-accent transition-colors hover:text-white"
              href="/evenements"
            >
              Films
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/80">{event.name}</span>
          </nav>
        </div>
      </div>

      <main>
        <section className="relative w-full overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/90 to-black/60" />
            {/* <div
              className="absolute inset-0 h-full w-full bg-cover bg-center blur-3xl opacity-30 scale-110"
              style={{ backgroundImage: `url('${event.backdrop}')` }}
            /> */}
            <div className="absolute top-0 right-0 h-125 w-125 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-125 w-125 translate-y-1/2 -translate-x-1/2 rounded-full bg-accent/10 blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto px-10 py-10 sm:px-12 lg:px-20 md:py-16">
            <div className="flex flex-col items-start gap-10 md:flex-row">
              <div className="space-y-6 text-center md:w-[55%] md:text-left">
                <div>
                  <h1 className="mb-4 text-5xl font-semibold uppercase tracking-wide text-glow md:text-6xl lg:text-5xl font-display">
                    {event.name}
                  </h1>
                  <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:justify-start font-display">
                    {!isAvailableNow ? (
                      <span className="rounded border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
                        Prochainement
                      </span>
                    ) : null}
                    {ageRestrictionLabel ? (
                      <span className="rounded border border-white/5 bg-white/10 px-3 py-1 text-xs text-white">
                        {ageRestrictionLabel}
                      </span>
                    ) : null}
                    <span className="rounded border border-primary/20 bg-primary/20 px-3 py-1 text-xs text-accent">
                      {genreLabel}
                    </span>
                    {durationLabel ? (
                      <span className="flex items-center gap-1 text-sm text-white/80">
                        <MdSchedule className="h-4 w-4 text-accent" />
                        {durationLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <h2 className="mb-2 flex items-center gap-2 text-lg text-white font-display">
                    <MdInfoOutline className="h-5 w-5 text-accent" />
                    Synopsis
                  </h2>
                  <p className="text-sm leading-relaxed text-white/70 md:text-base font-body">
                    {synopsis}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 font-body">
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent font-display">
                      Réalisé par
                    </span>
                    <span className="text-lg text-white">{directorLabel}</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent font-display">
                      Casting
                    </span>
                    <span className="text-lg text-white">{castLabel}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-center md:w-[45%] md:justify-start">
                <div className="relative group w-full">
                  <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-primary to-accent blur opacity-30 transition duration-1000 group-hover:opacity-60 group-hover:duration-200" />
                  <EventTrailer
                    poster={event.poster}
                    title={event.name}
                    trailerLink={trailerLink}
                    className="relative w-full aspect-[5/6] overflow-hidden rounded-xl border border-white/10 shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {isAvailableNow ? <SessionSelector sessions={sessions} /> : null}
      </main>
    </div>
  );
}
