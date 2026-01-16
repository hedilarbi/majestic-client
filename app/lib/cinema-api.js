import "server-only";

const RAW_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
const API_BASE_URL = RAW_API_BASE_URL.startsWith("http")
  ? RAW_API_BASE_URL
  : `http://${RAW_API_BASE_URL}`;
const SESSIONS_BY_DATE_ENDPOINT = "/sessions/by-date";
const FALLBACK_POSTER = "/images/logo.png";
const REVALIDATE_SECONDS = 60;

const formatDuration = (minutes) => {
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedMinutes)) return "";
  const hours = Math.floor(parsedMinutes / 60);
  const remainingMinutes = parsedMinutes % 60;
  if (hours <= 0) return `${parsedMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

const normalizeEvent = (event) => {
  if (!event) return null;
  const id = event._id || event.id;
  if (!id) return null;
  const genres = Array.isArray(event.genres) ? event.genres : [];
  const genresLabel = genres.length
    ? genres.slice(0, 2).join(" / ")
    : "Cinéma";
  const durationLabel = formatDuration(event.duration);
  return {
    id,
    title: event.name || event.title || "Événement",
    description:
      event.description || "Découvrez cette expérience cinéma prochainement.",
    poster: event.poster || FALLBACK_POSTER,
    trailerLink: event.trailerLink || event.trailer || "",
    genres,
    genresLabel,
    durationLabel,
    directedBy: event.directedBy || "",
    ageRestriction: event.ageRestriction ? String(event.ageRestriction) : "TP",
    badge: event.type === "show" ? "Spectacle" : "Film",
  };
};

const normalizeSession = (session) => {
  if (!session) return null;
  const time =
    session.sessionTime || session.time || session.startTime || session.hour;
  if (!time) return null;
  const label =
    session.version || session.format || session.language || "Séance";
  const isPremium = /imax|4dx|dolby|atmos/i.test(label);
  return {
    id: session._id || session.id || `${time}-${label}`,
    time,
    label,
    isPremium,
  };
};

const toMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
};

const addSessionToEvent = (eventEntry, session, dateKey) => {
  if (!eventEntry) return;
  if (dateKey && session?.date) {
    const sessionDate = session.date.slice(0, 10);
    if (sessionDate && sessionDate !== dateKey) return;
  }
  const normalizedSession = normalizeSession(session);
  if (!normalizedSession) return;
  eventEntry.sessions.push(normalizedSession);
};

const registerEvent = (eventsMap, eventData) => {
  const normalized = normalizeEvent(eventData);
  if (!normalized) return null;
  if (!eventsMap.has(normalized.id)) {
    eventsMap.set(normalized.id, { ...normalized, sessions: [] });
  }
  return eventsMap.get(normalized.id);
};

const consumeEntry = (eventsMap, entry, dateKey) => {
  if (!entry) return;
  const eventData = entry.eventId || entry.event || entry.eventData;
  const hasSessionsArray = Array.isArray(entry.sessions || entry.showtimes);
  const isSession = Boolean(entry.sessionTime || entry.time || entry.startTime);

  if (hasSessionsArray) {
    const eventEntry = registerEvent(eventsMap, eventData || entry);
    const sessions = entry.sessions || entry.showtimes || [];
    sessions.forEach((session) => addSessionToEvent(eventEntry, session, dateKey));
    return;
  }

  if (isSession) {
    const eventEntry = registerEvent(eventsMap, eventData);
    addSessionToEvent(eventEntry, entry, dateKey);
    return;
  }

  if (eventData) {
    registerEvent(eventsMap, eventData);
  }
};

export async function getSessionsByDate(dateKey) {
  if (!dateKey) {
    return { date: "", events: [] };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = new URL(SESSIONS_BY_DATE_ENDPOINT, API_BASE_URL);
    url.searchParams.set("date", dateKey);
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`cinema-${dateKey}`] },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Sessions by date API error: ${response.status}`);
    }

    const payload = await response.json();
    const eventsMap = new Map();

    if (Array.isArray(payload?.groups)) {
      payload.groups.forEach((entry) => consumeEntry(eventsMap, entry, dateKey));
    }

    if (Array.isArray(payload?.events)) {
      payload.events.forEach((entry) => consumeEntry(eventsMap, entry, dateKey));
    }

    if (Array.isArray(payload?.sessions)) {
      payload.sessions.forEach((entry) => consumeEntry(eventsMap, entry, dateKey));
    }

    if (Array.isArray(payload?.data)) {
      payload.data.forEach((entry) => consumeEntry(eventsMap, entry, dateKey));
    }

    if (Array.isArray(payload)) {
      payload.forEach((entry) => consumeEntry(eventsMap, entry, dateKey));
    }

    const events = Array.from(eventsMap.values())
      .map((event) => ({
        ...event,
        sessions: event.sessions.sort(
          (a, b) => toMinutes(a.time) - toMinutes(b.time)
        ),
      }))
      .filter((event) => event.sessions.length > 0)
      .sort((a, b) => {
        const aTime = a.sessions[0] ? toMinutes(a.sessions[0].time) : 0;
        const bTime = b.sessions[0] ? toMinutes(b.sessions[0].time) : 0;
        if (aTime !== bTime) return aTime - bTime;
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      });

    return { date: dateKey, events };
  } catch (error) {
    console.error("Sessions by date fetch failed:", error);
    return { date: dateKey, events: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}
