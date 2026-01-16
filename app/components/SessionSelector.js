"use client";

import { useMemo, useState } from "react";
import { MdArrowForward, MdCalendarMonth } from "react-icons/md";

const normalizeShortLabel = (value) =>
  value
    ? value.replace(".", "").replace(/^./, (char) => char.toUpperCase())
    : "";

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateKey) => {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map((value) => Number(value));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getDateParts = (dateKey) => {
  if (!dateKey) return { day: "", month: "", weekday: "" };
  const date = parseLocalDate(dateKey);
  if (!date || Number.isNaN(date.getTime())) {
    return { day: "", month: "", weekday: "" };
  }
  const day = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
  }).format(date);
  const month = new Intl.DateTimeFormat("fr-FR", {
    month: "short",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
  }).format(date);
  return {
    day,
    month: normalizeShortLabel(month),
    weekday: normalizeShortLabel(weekday),
  };
};

const formatShortDate = (dateKey) => {
  const { day, month } = getDateParts(dateKey);
  return [day, month].filter(Boolean).join(" ");
};

const toMinutes = (timeLabel) => {
  if (!timeLabel) return 0;
  const [hours, minutes] = timeLabel.split(":").map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
};

const getSessionDateTime = (dateKey, timeLabel) => {
  const date = parseLocalDate(dateKey);
  if (!date) return null;
  const [hours, minutes] = timeLabel.split(":").map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const groupSessionsByDate = (sessions, now) => {
  const sessionsByDate = new Map();
  const nowTime = now?.getTime?.() ?? Date.now();

  sessions.forEach((session) => {
    if (!session?.date) return;
    const dateKey = session.date.split("T")[0];
    if (!dateKey) return;
    const sessionDateTime = getSessionDateTime(dateKey, session.sessionTime);
    if (!sessionDateTime) return;
    if (sessionDateTime.getTime() < nowTime) return;
    const list = sessionsByDate.get(dateKey) ?? [];
    list.push(session);
    sessionsByDate.set(dateKey, list);
  });

  return {
    sessionsByDate,
    dateKeys: Array.from(sessionsByDate.keys()).sort(),
  };
};

export default function SessionSelector({ sessions = [] }) {
  const now = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(now), [now]);
  const { sessionsByDate, dateKeys } = useMemo(
    () => groupSessionsByDate(sessions, now),
    [sessions, now]
  );
  const defaultDateKey =
    dateKeys.find((dateKey) => dateKey === todayKey) ?? dateKeys[0] ?? "";
  const [activeDateKey, setActiveDateKey] = useState(defaultDateKey);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const safeActiveDateKey = dateKeys.includes(activeDateKey)
    ? activeDateKey
    : defaultDateKey;

  const sessionsForDate = useMemo(() => {
    const list = sessionsByDate.get(safeActiveDateKey) ?? [];
    return list
      .slice()
      .sort((a, b) => toMinutes(a.sessionTime) - toMinutes(b.sessionTime));
  }, [sessionsByDate, safeActiveDateKey]);

  const fallbackSessionId =
    sessionsForDate.find((session) => session.availableSeats > 0)?.id ??
    sessionsForDate[0]?.id ??
    null;
  const resolvedSessionId = sessionsForDate.some(
    (session) => session.id === selectedSessionId
  )
    ? selectedSessionId
    : fallbackSessionId;
  const selectedSession =
    sessionsForDate.find((session) => session.id === resolvedSessionId) ?? null;
  const selectedDateLabel = safeActiveDateKey
    ? formatShortDate(safeActiveDateKey)
    : "";

  const scheduleDays = dateKeys.map((dateKey) => {
    const { day, month, weekday } = getDateParts(dateKey);
    return {
      key: dateKey,
      label: dateKey === todayKey ? "Auj." : weekday,
      day,
      month,
      active: dateKey === safeActiveDateKey,
    };
  });

  const handleDateChange = (dateKey) => {
    setActiveDateKey(dateKey);
    setSelectedSessionId(null);
  };

  return (
    <section className="relative z-20 mx-auto mt-12 px-10 pb-20 sm:px-12 lg:px-20">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-primary to-accent opacity-50" />
        <div className="p-6 md:p-8">
          <h2 className="mb-6 flex items-center gap-3 text-2xl uppercase tracking-wide text-white font-display">
            <MdCalendarMonth className="h-6 w-6 text-accent" />
            Sélectionnez votre séance
          </h2>
          <div className="mb-10">
            {scheduleDays.length ? (
              <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
                {scheduleDays.map((day) => (
                  <button
                    key={day.key}
                    className={`snap-start min-w-22.5 rounded-xl border px-3 py-3 text-center transition-all font-display ${
                      day.active
                        ? "border-accent/30 bg-linear-to-b from-primary to-black text-white shadow-[0_0_15px_rgba(16,52,166,0.5),0_0_5px_rgba(116,208,241,0.3)] scale-105"
                        : "border-white/5 bg-white/10 text-white/50 hover:border-accent/40 hover:text-white hover:bg-white/20"
                    }`}
                    type="button"
                    onClick={() => handleDateChange(day.key)}
                  >
                    <span className="text-xs uppercase opacity-90">
                      {day.label}
                    </span>
                    <span className="block text-2xl">{day.day}</span>
                    <span className="text-xs opacity-80">{day.month}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60 font-body">
                Aucune séance disponible pour le moment.
              </p>
            )}
          </div>
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-black/40 p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
              {/* <div className="mb-4 flex items-center gap-3 text-sm text-white/60 font-display">
                Salle 1 • Grand Écran
              </div> */}
              <div className="flex flex-wrap gap-3">
                {sessionsForDate.length ? (
                  sessionsForDate.map((session) => {
                    const isActive = session.id === resolvedSessionId;
                    const soldOut = session.availableSeats <= 0;
                    return (
                      <button
                        key={session.id ?? session.sessionTime}
                        className={`relative flex flex-col items-center gap-1 rounded-lg border px-6 py-3 text-white transition-all duration-300 font-display ${
                          isActive
                            ? "border-accent/50 bg-primary shadow-[0_0_15px_rgba(16,52,166,0.5),0_0_5px_rgba(116,208,241,0.3)] ring-1 ring-accent ring-offset-2 ring-offset-black"
                            : "border-white/10 bg-white/10 hover:bg-primary hover:text-white hover:shadow-[0_0_15px_rgba(16,52,166,0.5),0_0_5px_rgba(116,208,241,0.3)]"
                        } ${soldOut ? "cursor-not-allowed opacity-60" : ""}`}
                        type="button"
                        disabled={soldOut}
                        onClick={() => setSelectedSessionId(session.id)}
                      >
                        <span className="text-lg">{session.sessionTime}</span>
                        <span className="text-[10px] font-normal uppercase opacity-80 font-body">
                          {session.version || "VF"}
                        </span>
                        {soldOut ? (
                          <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black shadow-lg">
                            Complet
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-white/60 font-body">
                    Aucune séance disponible pour cette date.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-white/10 p-4 md:flex-row md:p-6">
          <div className="hidden md:block font-body">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50 font-display">
              Votre sélection
            </span>
            {selectedSession ? (
              <div className="flex items-center gap-2 text-lg">
                <span className="text-white">{selectedDateLabel}</span>
                <span className="text-white/30">•</span>
                <span className="font-bold text-accent">
                  {selectedSession.sessionTime}
                </span>
              </div>
            ) : (
              <div className="text-white/40">Aucune séance disponible.</div>
            )}
          </div>
          <button
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-accent px-8 py-3 font-semibold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(16,52,166,0.6)] transition-all md:w-auto font-display ${
              selectedSession
                ? "hover:scale-105 hover:shadow-[0_0_25px_rgba(16,52,166,0.8)]"
                : "cursor-not-allowed opacity-60"
            }`}
            type="button"
            disabled={!selectedSession}
          >
            <span>Confirmer la séance</span>
            <MdArrowForward className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
