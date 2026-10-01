"use client";

import { useCallback, useMemo, useState } from "react";
import { MdCalendarMonth } from "react-icons/md";
import SessionDetailModal from "./SessionDetailModal";

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

const resolveSessionId = (session) => {
  const raw =
    session?.id ??
    session?._id ??
    session?.sessionId ??
    session?.seanceId ??
    "";
  const normalized = String(raw || "").trim();
  return normalized || null;
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

export default function SessionSelector({ sessions = [], event }) {
  const now = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(now), [now]);
  const { sessionsByDate, dateKeys } = useMemo(
    () => groupSessionsByDate(sessions, now),
    [sessions, now]
  );
  const defaultDateKey =
    dateKeys.find((dateKey) => dateKey === todayKey) ?? dateKeys[0] ?? "";
  const [activeDateKey, setActiveDateKey] = useState(defaultDateKey);
  const [activeSession, setActiveSession] = useState(null);
  const safeActiveDateKey = dateKeys.includes(activeDateKey)
    ? activeDateKey
    : defaultDateKey;

  const sessionsForDate = useMemo(() => {
    const list = sessionsByDate.get(safeActiveDateKey) ?? [];
    return list
      .slice()
      .sort((a, b) => toMinutes(a.sessionTime) - toMinutes(b.sessionTime));
  }, [sessionsByDate, safeActiveDateKey]);

  const selectedDateLabel = safeActiveDateKey
    ? formatShortDate(safeActiveDateKey)
    : "";

  const tomorrowKey = useMemo(() => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateKey(tomorrow);
  }, [now]);

  const scheduleDays = dateKeys.map((dateKey) => {
    const { day, month, weekday } = getDateParts(dateKey);
    const label =
      dateKey === todayKey
        ? "AUJ"
        : dateKey === tomorrowKey
        ? "DEM"
        : weekday.toUpperCase();
    return {
      key: dateKey,
      label,
      day,
      month,
      active: dateKey === safeActiveDateKey,
    };
  });

  const handleDateChange = (dateKey) => {
    setActiveDateKey(dateKey);
    setActiveSession(null);
  };

  const closeSessionModal = useCallback(() => setActiveSession(null), []);

  return (
    <>
    <section className="relative z-20 mx-auto mt-12 px-4 pb-20 sm:px-8 lg:px-20">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-primary to-accent opacity-50" />
        <div className="p-6 md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-lg uppercase tracking-wide text-white font-display md:gap-3 md:text-2xl">
            <MdCalendarMonth className="h-5 w-5 text-accent md:h-6 md:w-6" />
            Sélectionnez votre séance
          </h2>
          <div className="mb-10">
            {scheduleDays.length ? (
              <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-4 py-4">
                {scheduleDays.map((day) => (
                  <button
                    key={day.key}
                    className={`group relative flex h-24 w-20 snap-start flex-col items-center justify-center rounded-2xl border transition-transform hover:-translate-y-1 font-display md:h-32 md:w-24 ${
                      day.active
                        ? "border-accent bg-white/10 text-white shadow-[0_0_15px_rgba(116,208,241,0.3)]"
                        : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                    type="button"
                    onClick={() => handleDateChange(day.key)}
                  >
                    {day.active ? (
                      <div className="absolute inset-0 -z-10 rounded-2xl bg-accent/10 blur-md" />
                    ) : null}
                    <span
                      className={`mb-1 text-xs font-medium md:text-sm ${
                        day.active
                          ? "text-accent/80"
                          : "text-white/40 group-hover:text-accent"
                      }`}
                    >
                      {day.label}
                    </span>
                    <span
                      className={`mb-1 text-2xl font-bold md:text-3xl ${
                        day.active
                          ? "text-white"
                          : "text-white/80 group-hover:text-white"
                      }`}
                    >
                      {day.day}
                    </span>
                    <span className="text-[10px] font-medium text-white/40 md:text-xs">
                      {day.month.toUpperCase()}
                    </span>
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
              <div className="absolute left-0 top-0 h-full w-1 bg-accent" />
              {/* <div className="mb-4 flex items-center gap-3 text-sm text-white/60 font-display">
                Salle 1 • Grand Écran
              </div> */}
              <div className="flex flex-wrap gap-3">
                {sessionsForDate.length ? (
                  sessionsForDate.map((session) => {
                    const sessionId = resolveSessionId(session);
                    const soldOut = session.availableSeats <= 0;
                    return (
                      <button
                        key={sessionId ?? session.sessionTime}
                        className={`group/btn relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition-all duration-300 hover:border-accent/50 font-display md:px-6 md:py-2.5 ${soldOut ? "cursor-not-allowed opacity-60" : ""}`}
                        type="button"
                        disabled={soldOut}
                        onClick={() =>
                          setActiveSession({
                            event,
                            session: {
                              ...session,
                              id: sessionId,
                              time: session.sessionTime,
                              label: session.version || "VF",
                            },
                          })
                        }
                      >
                        <div className="absolute inset-0 bg-accent/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                        <span className="relative z-10 flex flex-col items-center">
                          <span
                            className="text-base font-bold tracking-wide text-white transition-colors md:text-lg"
                          >
                            {session.sessionTime}
                          </span>
                          <span
                            className="text-[9px] font-medium uppercase tracking-wider text-white/60 transition-colors group-hover/btn:text-white/90 md:text-[10px] font-body"
                          >
                            {session.version || "VF"}
                          </span>
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
      </div>
    </section>
    <SessionDetailModal
      selection={activeSession}
      dateLabel={selectedDateLabel}
      onClose={closeSessionModal}
    />
    </>
  );
}
