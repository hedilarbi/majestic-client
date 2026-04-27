export const ACTUALITE_TYPE_META = {
  article: {
    label: "Article",
    accentClass: "bg-primary/15 text-accent border-primary/30",
  },
  trailer: {
    label: "Bande-annonce",
    accentClass: "bg-accent/20 text-accent border-accent/30",
  },
  form: {
    label: "Formulaire",
    accentClass: "bg-white/10 text-white/80 border-white/10",
  },
};

export const stripHtml = (value) =>
  typeof value === "string"
    ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : "";

export const formatActualiteDate = (value, options) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    ...(options || {}),
  }).format(date);
};

export const getActualiteSummary = (item) => {
  const excerpt = typeof item?.excerpt === "string" ? item.excerpt.trim() : "";
  if (excerpt) {
    return excerpt;
  }

  if (item?.type === "article") {
    return stripHtml(item?.contentHtml).slice(0, 220).trim();
  }

  if (item?.type === "trailer") {
    return "Découvrez la nouvelle bande-annonce publiée par Le Majestic.";
  }

  if (item?.type === "form") {
    return item?.formDescription || "Participez en remplissant ce formulaire.";
  }

  return "";
};

export const getActualiteCoverImage = (item) =>
  item?.image || item?.thumbnail || "/images/logo.png";

export const getActualiteHref = (item) => {
  const slug = typeof item?.slug === "string" ? item.slug.trim() : "";
  const fallback = typeof item?.id === "string" ? item.id.trim() : "";
  const segment = slug || fallback;

  return segment ? `/actualite/${encodeURIComponent(segment)}` : "/actualite";
};

export const getVideoEmbedUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const url = value.trim();

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace(/^\//, "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.replace(/^\//, "");
      return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
    }
  } catch (_error) {
    return "";
  }

  return "";
};
