import Image from "next/image";
import Link from "next/link";
import CinemaCalendarButton from "../components/CinemaCalendarButton";
import TrailerModalButton from "../components/TrailerModalButton";
import { getSessionsByDate } from "../lib/cinema-api";
import {
  MdExplicit,
  MdFavoriteBorder,
  MdFilterList,
  MdMovieFilter,
  MdSchedule,
  MdVideocam,
  Md3dRotation,
} from "react-icons/md";

const DAYS_TO_SHOW = 10;
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
});
const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", { month: "short" });

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateParam = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const formatWeekday = (date) =>
  WEEKDAY_FORMATTER.format(date).replace(".", "").toUpperCase();

const formatMonth = (date) =>
  MONTH_FORMATTER.format(date).replace(".", "").toUpperCase();

const buildDateOptions = (startDate, selectedKey) => {
  const options = [];
  for (let index = 0; index < DAYS_TO_SHOW; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const value = formatDateKey(date);
    options.push({
      value,
      label: index === 0 ? "AUJ" : index === 1 ? "DEM" : formatWeekday(date),
      day: String(date.getDate()),
      month: formatMonth(date),
      isActive: value === selectedKey,
    });
  }
  return options;
};

export default async function CinemaPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const today = new Date();
  const todayKey = formatDateKey(today);
  const requestedDate = parseDateParam(resolvedParams?.date);
  const selectedDateKey = requestedDate
    ? formatDateKey(requestedDate)
    : todayKey;
  const activeDateKey = selectedDateKey < todayKey ? todayKey : selectedDateKey;
  const dateOptions = buildDateOptions(today, activeDateKey);
  const { events } = await getSessionsByDate(activeDateKey);

  return (
    <main className="relative min-h-screen w-full px-10 pb-20 pt-6 text-white sm:px-12 lg:px-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] opacity-60" />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-full bg-accent/10 blur-[100px] opacity-40" />
      </div>

      <section className="relative mb-16 mt-8">
        <div className="pointer-events-none absolute -top-16 left-0 w-full select-none overflow-hidden">
          <h2 className="whitespace-nowrap text-[10rem] font-black leading-none tracking-tighter text-transparent opacity-20 [-webkit-text-stroke:1px_rgba(255,255,255,0.05)]">
            PROGRAMME
          </h2>
        </div>
        <div className="relative mb-8 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-accent font-display">
              À l&apos;affiche cette semaine
            </p>
            <h3 className="text-4xl font-bold text-white drop-shadow-lg md:text-5xl font-display">
              Sélectionnez une date
            </h3>
          </div>
          <div className="flex gap-2">
            {/* <button className="rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10">
              <MdFilterList className="h-5 w-5 text-white/60" />
            </button> */}
            <CinemaCalendarButton
              selectedDate={activeDateKey}
              todayKey={todayKey}
            />
          </div>
        </div>
        <div className="hide-scrollbar w-full overflow-x-auto pb-8 pt-4">
          <div className="flex min-w-max gap-4 px-2">
            {dateOptions.map((date) => (
              <Link
                key={date.value}
                href={`/programme?date=${date.value}`}
                aria-current={date.isActive ? "date" : undefined}
                className={`group relative flex h-32 w-24 flex-col items-center justify-center rounded-2xl border transition-transform hover:-translate-y-1 ${
                  date.isActive
                    ? "border-accent bg-linear-to-br from-white/10 to-black shadow-[0_0_15px_rgba(116,208,241,0.3)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {date.isActive ? (
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-accent/10 blur-md" />
                ) : null}
                <span
                  className={`mb-1 text-sm font-medium ${
                    date.isActive
                      ? "text-accent/80"
                      : "text-white/40 group-hover:text-accent"
                  }`}
                >
                  {date.label}
                </span>
                <span
                  className={`mb-1 text-3xl font-bold ${
                    date.isActive
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {date.day}
                </span>
                <span className="text-xs font-medium text-white/40">
                  {date.month}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        {events.length ? (
          events.map((event, index) => (
            <article
              key={event.id}
              className="group relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-all hover:bg-white/[0.08] lg:flex-row lg:p-8"
            >
              <div
                className={`pointer-events-none absolute h-64 w-64 rounded-full blur-[80px] transition-colors duration-500 ${
                  index % 2 === 0
                    ? "-right-20 -top-20 bg-primary/10 group-hover:bg-primary/20"
                    : "-bottom-20 -left-20 bg-accent/10 group-hover:bg-accent/20"
                }`}
              />
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-2xl lg:w-64">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
                <Image
                  src={event.poster}
                  alt={`Affiche de ${event.title}`}
                  fill
                  sizes="(min-width: 1024px) 240px, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* <div className="absolute left-3 top-3 z-20 rounded-lg border border-white/10 bg-black/60 px-3 py-1 backdrop-blur-md">
                  <span className="flex items-center gap-1 text-xs font-bold tracking-wider text-white">
                    <MdExplicit className="text-accent" />
                    {event.ageRestriction}
                  </span>
                </div> */}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="mb-6">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-accent">
                      <span className="rounded border border-accent/20 bg-accent/10 px-2 py-1">
                        {event.badge}
                      </span>
                      <span>{event.genresLabel}</span>
                    </div>
                  </div>
                  <h3 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-white font-display">
                    {event.title}
                  </h3>
                  <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-white/60 font-body">
                    {event.durationLabel ? (
                      <div className="flex items-center gap-2">
                        <MdSchedule className="text-base" />
                        {event.durationLabel}
                      </div>
                    ) : null}
                    {event.directedBy ? (
                      <div className="flex items-center gap-2">
                        <MdVideocam className="text-base" />
                        {event.directedBy}
                      </div>
                    ) : null}
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base font-body">
                    {event.description}
                  </p>
                </div>
                <div className="space-y-3">
                  {/* <p className="text-sm font-medium uppercase tracking-wider text-white/40 font-body">
                    Séances disponibles
                  </p> */}
                  <TrailerModalButton
                    trailerLink={event.trailerLink}
                    title={event.title}
                  />
                  {event.sessions.length ? (
                    <div className="flex flex-wrap gap-3">
                      {event.sessions.map((session) => (
                        <button
                          key={session.id}
                          className={`group/btn relative overflow-hidden rounded-xl border px-6 py-2.5 transition-all duration-300 ${
                            session.isPremium
                              ? "border-accent/60 bg-accent/10 shadow-[0_0_10px_rgba(116,208,241,0.1)]"
                              : "border-white/10 bg-white/5 hover:border-accent/50"
                          }`}
                          type="button"
                        >
                          <div className="absolute inset-0 bg-linear-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                          <span className="relative z-10 flex flex-col items-center">
                            <span
                              className={`text-lg font-bold tracking-wide transition-colors ${
                                session.isPremium
                                  ? "text-accent group-hover/btn:text-white"
                                  : "text-white"
                              }`}
                            >
                              {session.time}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                                session.isPremium
                                  ? "text-accent/80 group-hover/btn:text-white/90"
                                  : "text-white/60 group-hover/btn:text-white/90"
                              }`}
                            >
                              {session.isPremium ? (
                                <Md3dRotation className="text-xs" />
                              ) : null}
                              {session.label}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50 font-body">
                      Aucune séance disponible pour cette date.
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60 font-body">
            Aucune séance disponible pour cette date.
          </div>
        )}
      </section>

      <div className="mt-12 flex items-center justify-center text-white/40">
        <MdMovieFilter className="mr-2 text-lg" />
        Programme Cinéma
      </div>
    </main>
  );
}
