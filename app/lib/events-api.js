import "server-only";

const RAW_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
const API_BASE_URL = RAW_API_BASE_URL.startsWith("http")
  ? RAW_API_BASE_URL
  : `http://${RAW_API_BASE_URL}`;
const EVENTS_ENDPOINT = "/events/with-a-laffiche";
const FALLBACK_POSTER = "/images/logo.png";
const REVALIDATE_SECONDS = 60;

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const formatDuration = (minutes) => {
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedMinutes)) return "";
  const hours = Math.floor(parsedMinutes / 60);
  const remainingMinutes = parsedMinutes % 60;
  if (hours <= 0) return `${parsedMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

const buildMetaLine = (genreLabel, durationLabel) => {
  if (genreLabel && durationLabel) return `${genreLabel} • ${durationLabel}`;
  return genreLabel || durationLabel || "";
};

const normalizeEvent = (event) => {
  if (!event || !event._id) return null;
  const genreLabel = isNonEmptyArray(event.genres) ? event.genres[0] : "";
  const durationLabel = formatDuration(event.duration);
  return {
    id: event._id,
    type: event.type || "",
    title: event.name || "Événement",
    description: event.description || "",
    image: event.poster || FALLBACK_POSTER,
    imageAlt: event.name
      ? `Affiche de ${event.name}`
      : "Affiche de l'événement",
    meta: buildMetaLine(genreLabel, durationLabel),
    genres: Array.isArray(event.genres) ? event.genres : [],
    duration: Number.isFinite(event.duration) ? event.duration : null,
    trailerLink: event.trailerLink || "",
  };
};

const normalizeALaffiche = (entries) => {
  const list = Array.isArray(entries) ? entries : entries ? [entries] : [];
  return list
    .map((entry) => {
      const eventData = entry?.eventId || entry?.event;
      const normalizedEvent = normalizeEvent(eventData);
      const entryHasContent =
        entry?.poster || entry?.title || entry?.subtitle || entry?.eventAffiche;

      if (!normalizedEvent && !entryHasContent) return null;

      const rawEventId =
        normalizedEvent?.id ||
        (typeof entry?.eventId === "string" ? entry.eventId : undefined) ||
        (eventData?._id ? String(eventData._id) : undefined);
      const eventPoster = eventData?.poster || normalizedEvent?.image;
      const poster = entry?.poster || eventPoster || FALLBACK_POSTER;

      return {
        event: normalizedEvent,
        eventId: rawEventId,
        poster,
        title: entry?.title || normalizedEvent?.title,
        subtitle: entry?.subtitle || normalizedEvent?.description,
        eventPoster,
        eventAffiche: Boolean(entry?.eventAffiche),
      };
    })
    .filter(Boolean);
};

export async function getEventsWithALaffiche({
  type = "movie",
  genre,
  noCache,
} = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = new URL(EVENTS_ENDPOINT, API_BASE_URL);
    if (type) url.searchParams.set("type", type);
    if (genre) url.searchParams.set("genre", genre);

    const fetchOptions = {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    };
    if (noCache) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = {
        revalidate: REVALIDATE_SECONDS,
        tags: [`events-${type || "all"}`],
      };
    }
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Events API error: ${response.status}`);
    }

    const payload = await response.json();

    const events = Array.isArray(payload.events)
      ? payload.events.map(normalizeEvent).filter(Boolean)
      : [];
    const aLaffiche = normalizeALaffiche(payload.aLaffiche || []);
    const prochainement = Array.isArray(payload.prochainement)
      ? payload.prochainement.map(normalizeEvent).filter(Boolean)
      : [];
    const showTypes = Array.isArray(payload.showTypes)
      ? payload.showTypes.map((entry) => entry?.name || entry).filter(Boolean)
      : [];

    return { events, aLaffiche, showTypes, prochainement };
  } catch (error) {
    console.error("Events fetch failed:", error);
    return { events: [], aLaffiche: [], showTypes: [], prochainement: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}
