import "server-only";

const RAW_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
const API_BASE_URL = RAW_API_BASE_URL.startsWith("http")
  ? RAW_API_BASE_URL
  : `http://${RAW_API_BASE_URL}`;
const HOME_ENDPOINT = "/events/home";
const FALLBACK_POSTER = "/images/logo.png";
const FALLBACK_HERO = {
  titleLead: "À LA UNE",
  titleHighlight: "EXPÉRIENCE CINÉMA",
  subtitle:
    "Plongez dans les derniers blockbusters avec un son et une image de qualité supérieure. Vivez le cinéma comme jamais auparavant.",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBu1xY2sBF4hbn7uFPA6T-PAZeX0kYTpSgUCe9R7afddNmtMYYcyLraIYSGXNGvGbErCVjRkf7Mq5_8jGOr4hwF9uJRN-qhdXWD2iOW_kniXonNiLqvWTFHOkpdLuH4HzR1JTHD4d9RoI0CW1JW-hVbKcw7tulYYLz7TfqeBeYYPRfvAosp773eDm78Di5Y9YTh-aFPdkJASFoakwlqwtUuJyNOfg1WppifzLRn9OAVlKpak-AabL9FoIWTGYWYMz0yPqAHCNpopC8",
  imageAlt: "Scène cinématographique dramatique avec éclairage bleu et violet",
};

const REVALIDATE_SECONDS = 60;

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const formatDuration = (minutes) => {
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedMinutes)) return "";
  const hours = Math.floor(parsedMinutes / 60);
  const remainingMinutes = parsedMinutes % 60;
  if (hours <= 0) return `${parsedMinutes}m`;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

const formatDateLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const monthLabel = capitalize(month);
  return [day, monthLabel].filter(Boolean).join(" ");
};

const buildMetaLine = (genreLabel, durationLabel) => {
  if (genreLabel && durationLabel) return `${genreLabel} • ${durationLabel}`;
  return genreLabel || durationLabel || "";
};

const buildVersionsLabel = (versions) => {
  if (!isNonEmptyArray(versions)) return "";
  return versions.join(" • ");
};

const toHeroSlides = (slides = []) => {
  const activeSlides = slides
    .filter((slide) => slide && slide.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((slide) => ({
      id: slide._id,

      titleHighlight: slide.title || FALLBACK_HERO.titleHighlight,
      subtitle: slide.subtitle || FALLBACK_HERO.subtitle,
      image: slide.poster || FALLBACK_HERO.image,
      imageAlt: slide.title
        ? `Affiche de ${slide.title}`
        : FALLBACK_HERO.imageAlt,
      eventId: slide.eventId,
    }));

  return activeSlides.length
    ? activeSlides
    : [{ id: "fallback", ...FALLBACK_HERO }];
};

const toNowShowing = (items = []) => {
  const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;

  return items.map((item) => {
    const genreLabel = isNonEmptyArray(item.genres) ? item.genres[0] : "Film";
    const durationLabel = formatDuration(item.duration);
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const isNew =
      createdAt instanceof Date &&
      !Number.isNaN(createdAt.getTime()) &&
      now - createdAt.getTime() <= weekInMs;

    return {
      id: item._id,
      title: item.name || "Film",
      meta: buildMetaLine(genreLabel, durationLabel),
      badge: isNew ? "Nouveau" : "",
      badgeTone: isNew ? "accent" : "",
      image: item.poster || FALLBACK_POSTER,
      imageAlt: item.name ? `Affiche du film ${item.name}` : "Affiche du film",
      createdAt: item.createdAt || null,
    };
  });
};

const toSpectacles = (items = []) =>
  items.map((item) => {
    const genreLabel = isNonEmptyArray(item.genres)
      ? item.genres[0]
      : "Spectacle";
    const durationLabel = formatDuration(item.duration);
    const versionsLabel = buildVersionsLabel(item.availableVersions);
    const meta = [durationLabel, versionsLabel].filter(Boolean).join(" • ");
    return {
      id: item._id,
      title: item.name || "Spectacle",
      genre: genreLabel,
      meta: meta || "Durée à confirmer",
      image: item.poster || FALLBACK_POSTER,
      imageAlt: item.name
        ? `Affiche du spectacle ${item.name}`
        : "Affiche du spectacle",
    };
  });

const toUpcoming = (items = []) =>
  items.map((item) => {
    const dateLabel = formatDateLabel(
      item.releaseDate || item.availableFrom || item.createdAt
    );
    return {
      id: item._id,
      title: item.name || "Bientôt",
      date: dateLabel || "Bientôt",
      description:
        item.description || "Découvrez bientôt cette nouvelle expérience.",
      image: item.poster || FALLBACK_POSTER,
      imageAlt: item.name ? `Teaser du film ${item.name}` : "Teaser du film",
    };
  });

export const normalizeHomeData = (
  payload = {},
  { limitNowShowing = true, limitUpcoming = true } = {}
) => {
  const heroSlides = toHeroSlides(payload.homeSlider || []);
  const nowShowingRaw = toNowShowing(payload.aLaffiche || []);
  const nowShowing = limitNowShowing
    ? nowShowingRaw.slice(0, 5)
    : nowShowingRaw;
  const spectacles = toSpectacles(payload.spectacles || []);
  const upcomingRaw = toUpcoming(payload.prochainement || []);
  const upcoming = limitUpcoming ? upcomingRaw.slice(0, 2) : upcomingRaw;

  return {
    heroSlides,
    nowShowing,
    spectacles,
    upcoming,
  };
};

export async function getHomeData(options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = new URL(HOME_ENDPOINT, API_BASE_URL);
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["home"] },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Home API error: ${response.status}`);
    }

    const payload = await response.json();
    return normalizeHomeData(payload, options);
  } catch (error) {
    console.error("Home data fetch failed:", error);
    return normalizeHomeData(undefined, options);
  } finally {
    clearTimeout(timeoutId);
  }
}
