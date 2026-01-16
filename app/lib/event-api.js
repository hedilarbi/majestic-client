import "server-only";

const RAW_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
const API_BASE_URL = RAW_API_BASE_URL.startsWith("http")
  ? RAW_API_BASE_URL
  : `http://${RAW_API_BASE_URL}`;
const SESSION_ENDPOINT = "/sessions/home";
const FALLBACK_POSTER = "/images/logo.png";
const REVALIDATE_SECONDS = 60;

const normalizeEvent = (event) => {
  if (!event || !event._id) return null;
  return {
    id: event._id,
    type: event.type || "",
    name: event.name || "Événement",
    poster: event.poster || FALLBACK_POSTER,
    genres: Array.isArray(event.genres) ? event.genres : [],
    duration: Number.isFinite(event.duration) ? event.duration : null,
    ageRestriction: event.ageRestriction || "",
    description: event.description || "",
    trailerLink: event.trailerLink || "",
    directedBy: event.directedBy || "",
    cast: Array.isArray(event.cast) ? event.cast : [],
  };
};

const normalizeSessions = (sessions) =>
  Array.isArray(sessions)
    ? sessions.map((session) => ({
        id: session._id,
        date: session.date,
        sessionTime: session.sessionTime,
        version: session.version,
        availableSeats: Number.isFinite(session.availableSeats)
          ? session.availableSeats
          : 0,
      }))
    : [];

export async function getEventSessions(eventId) {
  if (!eventId) {
    return { event: null, sessions: [] };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = new URL(`${SESSION_ENDPOINT}/${eventId}`, API_BASE_URL);
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`event-${eventId}`] },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Event session API error: ${response.status}`);
    }

    const payload = await response.json();
    return {
      event: normalizeEvent(payload.event),
      sessions: normalizeSessions(payload.sessions),
    };
  } catch (error) {
    console.error("Event session fetch failed:", error);
    return { event: null, sessions: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}
