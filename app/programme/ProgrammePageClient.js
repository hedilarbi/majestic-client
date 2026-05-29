"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Md3dRotation,
  MdClose,
  MdMovieFilter,
  MdSchedule,
} from "react-icons/md";

import CinemaCalendarButton from "../components/CinemaCalendarButton";
import TrailerModalButton from "../components/TrailerModalButton";

const SESSION_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const parseDateKey = (dateKey) => {
  if (typeof dateKey !== "string") {
    return null;
  }
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
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

const formatSessionDate = (dateKey) => {
  const date = parseDateKey(dateKey);
  if (!date) {
    return "Date indisponible";
  }

  const formatted = SESSION_DATE_FORMATTER.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default function ProgrammePageClient({
  dateOptions = [],
  events = [],
  activeDateKey = "",
  todayKey = "",
}) {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState(null);

  const activeSessionDateLabel = useMemo(
    () => formatSessionDate(activeDateKey),
    [activeDateKey],
  );

  const closeSessionModal = useCallback(() => {
    setActiveSession(null);
  }, []);

  useEffect(() => {
    if (!activeSession) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSessionModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSession, closeSessionModal]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (activeSession) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeSession]);

  const handleOpenSession = useCallback((eventItem, sessionItem) => {
    if (!eventItem || !sessionItem) {
      return;
    }
    setActiveSession({
      event: eventItem,
      session: sessionItem,
    });
  }, []);

  const handleReserveNow = useCallback(() => {
    const sessionId = activeSession?.session?.id;
    if (!sessionId) {
      return;
    }
    router.push(`/reservations/${sessionId}`);
  }, [activeSession, router]);

  const modalSessionTime = String(activeSession?.session?.time || "").trim();
  const modalSessionVersion = String(activeSession?.session?.label || "").trim();
  const modalSessionDuration = String(activeSession?.event?.durationLabel || "").trim();

  return (
    <>
      <main className="relative min-h-screen w-full px-4 pb-14 pt-5 text-white sm:px-6 md:px-12 md:pb-20 md:pt-6 lg:px-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px] opacity-60" />
          <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-full bg-accent/10 blur-[100px] opacity-40" />
        </div>

        <section className="relative mb-10 mt-4 md:mb-16 md:mt-8">
          <div className="pointer-events-none absolute -top-16 left-0 w-full select-none overflow-hidden">
            <h2 className="whitespace-nowrap text-[10rem] font-black leading-none tracking-tighter text-transparent opacity-20 [-webkit-text-stroke:1px_rgba(255,255,255,0.05)]">
              PROGRAMME
            </h2>
          </div>
          <div className="relative mb-6 flex flex-col items-end justify-between gap-4 md:mb-8 md:gap-6 md:flex-row">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent font-display md:mb-2 md:text-sm">
                A l&apos;affiche cette semaine
              </p>
              <h3 className="text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl font-display">
                Selectionnez une date
              </h3>
            </div>
            <div className="flex gap-2">
              <CinemaCalendarButton
                selectedDate={activeDateKey}
                todayKey={todayKey}
              />
            </div>
          </div>
          <div className="hide-scrollbar w-full overflow-x-auto pb-5 pt-3 md:pb-8 md:pt-4">
            <div className="flex min-w-max gap-3 px-1.5 md:gap-4 md:px-2">
              {dateOptions.map((date) => (
                <Link
                  key={date.value}
                  href={`/programme?date=${date.value}`}
                  aria-current={date.isActive ? "date" : undefined}
                  className={`group relative flex h-24 w-20 flex-col items-center justify-center rounded-2xl border transition-transform hover:-translate-y-1 md:h-32 md:w-24 ${
                    date.isActive
                      ? "border-accent bg-white/10 shadow-[0_0_15px_rgba(116,208,241,0.3)]"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {date.isActive ? (
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-accent/10 blur-md" />
                  ) : null}
                  <span
                    className={`mb-1 text-xs font-medium md:text-sm ${
                      date.isActive
                        ? "text-accent/80"
                        : "text-white/40 group-hover:text-accent"
                    }`}
                  >
                    {date.label}
                  </span>
                  <span
                    className={`mb-1 text-2xl font-bold md:text-3xl ${
                      date.isActive
                        ? "text-white"
                        : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {date.day}
                  </span>
                  <span className="text-[10px] font-medium text-white/40 md:text-xs">
                    {date.month}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5 md:gap-8">
          {events.length ? (
            events.map((event, index) => (
              <article
                key={event.id}
                className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-all hover:bg-white/[0.08] md:gap-8 md:p-6 lg:flex-row lg:p-8"
              >
                <div
                  className={`pointer-events-none absolute h-64 w-64 rounded-full blur-[80px] transition-colors duration-500 ${
                    index % 2 === 0
                      ? "-right-20 -top-20 bg-accent/10 group-hover:bg-accent/20"
                      : "-bottom-20 -left-20 bg-accent/10 group-hover:bg-accent/20"
                  }`}
                />
                <div className="relative z-10 flex flex-col gap-3 md:hidden">
                  <div className="flex items-start gap-3">
                    <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-2xl shadow-2xl">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
                      <Image
                        src={event.poster}
                        alt={`Affiche de ${event.title}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-h-[144px] flex-1 flex-col rounded-2xl border border-white/10 bg-black/35 p-3">
                      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-accent">
                        <span className="rounded border border-accent/20 bg-accent/10 px-2 py-0.5">
                          {event.badge}
                        </span>
                        <span className="truncate">{event.genresLabel}</span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-bold leading-tight text-white font-display">
                        {event.title}
                      </h3>
                      <div className="mt-2 space-y-1 text-[11px] text-white/70 font-body">
                        {event.durationLabel ? (
                          <p className="flex items-center gap-1.5">
                            <MdSchedule className="text-[13px]" />
                            {event.durationLabel}
                          </p>
                        ) : null}
                      </div>
                      <TrailerModalButton
                        trailerLink={event.trailerLink}
                        title={event.title}
                        className="mt-auto inline-flex w-full items-center justify-center rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] font-display"
                      />
                    </div>
                  </div>

                  {event.sessions.length ? (
                    <div className="flex flex-wrap gap-2">
                      {event.sessions.map((session) => (
                        <button
                          key={session.id}
                          className={`group/btn relative overflow-hidden rounded-xl border px-4 py-2 transition-all duration-300 ${
                            session.isPremium
                              ? "border-accent/60 bg-accent/10 shadow-[0_0_10px_rgba(116,208,241,0.1)]"
                              : "border-white/10 bg-white/5 hover:border-accent/50"
                          }`}
                          type="button"
                          onClick={() => handleOpenSession(event, session)}
                        >
                          <div className="absolute inset-0 bg-accent/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                          <span className="relative z-10 flex flex-col items-center">
                            <span
                              className={`text-base font-bold tracking-wide transition-colors ${
                                session.isPremium
                                  ? "text-accent group-hover/btn:text-white"
                                  : "text-white"
                              }`}
                            >
                              {session.time}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider transition-colors ${
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
                    <p className="text-xs text-white/50 font-body">
                      Aucune séance disponible pour cette date.
                    </p>
                  )}
                </div>

                <div className="hidden md:flex md:flex-1 md:items-start md:gap-6 lg:gap-8">
                  <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-2xl shadow-2xl md:w-52 lg:w-64">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
                    <Image
                      src={event.poster}
                      alt={`Affiche de ${event.title}`}
                      fill
                      sizes="(min-width: 1024px) 240px, 40vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
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
                      <h3 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-white md:mb-3 md:text-4xl font-display">
                        {event.title}
                      </h3>
                      <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-white/60 font-body">
                        {event.durationLabel ? (
                          <div className="flex items-center gap-2">
                            <MdSchedule className="text-base" />
                            {event.durationLabel}
                          </div>
                        ) : null}
                      </div>
                      <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base font-body">
                        {event.description}
                      </p>
                    </div>
                    <div className="space-y-3">
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
                              onClick={() => handleOpenSession(event, session)}
                            >
                              <div className="absolute inset-0 bg-accent/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
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
          Programme Cinema
        </div>
      </main>

      {activeSession ? (
        <div className="fixed inset-0 z-[120]">
          <button
            type="button"
            aria-label="Fermer le detail de la séance"
            onClick={closeSessionModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
          />
          <aside className="absolute right-0 top-0 h-screen w-full overflow-y-auto border-l border-white/10 bg-[#0a0f17] shadow-2xl md:w-[33vw]">
            <div className="relative flex h-full flex-col">
              <div className="absolute inset-0">
                <Image
                  src={activeSession.event.poster}
                  alt={`Affiche ${activeSession.event.title}`}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f17]/40 via-[#0a0f17]/90 to-[#0a0f17]" />
              </div>

              <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
                      Details séance
                    </p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-white font-display">
                      {activeSession.event.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={closeSessionModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/80 transition hover:text-white"
                  >
                    <MdClose className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <p className="text-2xl font-semibold text-white/90 md:text-3xl">
                    {activeSessionDateLabel}
                  </p>
                  <p className="mt-2 text-5xl font-black tracking-tight text-white md:text-6xl">
                    {modalSessionTime || "--:--"}
                  </p>
                  <p className="mt-3 text-sm font-normal uppercase tracking-[0.24em] text-white/75 md:text-base">
                    {modalSessionVersion || "Version"}
                  </p>
                  {modalSessionDuration ? (
                    <p className="mt-10 text-sm font-medium text-white/85 md:text-base">
                      Duree: {modalSessionDuration}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleReserveNow}
                    className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
                  >
                    Reserver maintenant
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
