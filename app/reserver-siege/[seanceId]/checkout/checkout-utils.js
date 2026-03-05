export const FALLBACK_POSTER = "/images/logo.png";
export const EXPIRED_RESERVATION_MESSAGE =
  "Vos reservations ont expire. Merci de refaire la selection des sieges.";
export const CHECKOUT_INTENT_STORAGE_KEY =
  "majestic_reserver_siege_checkout_intent";
export const SUCCESS_BOOKING_STORAGE_KEY =
  "majestic_reserver_siege_success_booking";

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const isLikelyObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value.trim());

const sanitizeDisplayValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).trim();
  if (!text || isLikelyObjectId(text)) {
    return "";
  }

  return text;
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return capitalize(formatter.format(date));
};

const toNonNegativeIntegerOrNull = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replace(",", "."));

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(parsed));
};

const normalizeOverrideMeta = (raw) => {
  if (!raw) {
    return null;
  }

  if (typeof raw === "string" || typeof raw === "number") {
    return { id: String(raw), name: "", price: null };
  }

  if (typeof raw !== "object") {
    return null;
  }

  const nestedPricing =
    raw.pricingId && typeof raw.pricingId === "object" ? raw.pricingId : null;
  const source = nestedPricing || raw;

  const id =
    source?._id ??
    source?.id ??
    raw?.pricingId ??
    raw?.pricingOverrideId ??
    raw?.id ??
    "";
  const name =
    source?.name ?? source?.nom ?? raw?.label ?? raw?.name ?? raw?.nom ?? "";
  const price =
    source?.price ??
    source?.prix ??
    raw?.price ??
    raw?.prix ??
    raw?.amount ??
    raw?.montant ??
    null;

  if (!id && !name && price === null) {
    return null;
  }

  return {
    id: id ? String(id) : name ? String(name) : "",
    name,
    price,
  };
};

export const normalizeSocketUrl = (value) => {
  const browserOrigin =
    typeof window !== "undefined" ? String(window.location.origin || "") : "";
  const raw = String(value || "").trim();
  const candidate = raw || browserOrigin;

  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("/")) {
    return browserOrigin.replace(/\/$/, "");
  }

  const normalizedCandidate = candidate.replace(/^wss?:\/\//i, (match) =>
    match.toLowerCase() === "wss://" ? "https://" : "http://",
  );
  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(normalizedCandidate);
  const baseForRelative = browserOrigin || undefined;
  const safeInput = hasProtocol
    ? normalizedCandidate
    : `https://${normalizedCandidate}`;

  try {
    const parsed = new URL(safeInput, baseForRelative);

    if (typeof window !== "undefined") {
      const pageProtocol = String(window.location.protocol || "").toLowerCase();
      if (pageProtocol === "https:" && parsed.protocol === "http:") {
        parsed.protocol = "https:";
      }

      const pageHost = String(window.location.hostname || "").toLowerCase();
      const socketHost = String(parsed.hostname || "").toLowerCase();
      const isLocalLikeHost =
        socketHost === "localhost" ||
        socketHost === "0.0.0.0" ||
        socketHost.startsWith("127.") ||
        socketHost.endsWith(".local") ||
        !socketHost.includes(".");

      if (pageHost && socketHost && pageHost !== socketHost && isLocalLikeHost) {
        return browserOrigin.replace(/\/$/, "");
      }
    }

    return parsed.origin.replace(/\/$/, "");
  } catch (_error) {
    return browserOrigin.replace(/\/$/, "");
  }
};

export const resolveRedirectPath = (value, fallback = "/profil") => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  return trimmed;
};

export const toNumber = (value) => {
  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "string" && /[a-z]/i.test(value)) {
    return value;
  }

  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  return `${numeric.toFixed(2).replace(".", ",")} DT`;
};

export const formatSeatLabel = (seat) => {
  if (!seat || seat.row === undefined || seat.col === undefined) {
    return "";
  }
  return `${seat.row}${seat.col}`;
};

export const normalizeSubscriptionCode = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) {
    return "";
  }

  return /^[A-Z0-9-]{4,64}$/.test(normalized) ? normalized : "";
};

export const normalizePromoCode = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) {
    return "";
  }

  return /^[A-Z0-9-]{2,64}$/.test(normalized) ? normalized : "";
};

export const resolveSeanceInfo = (data) => {
  const session = data?.session || data?.seance || data || {};
  const eventFromSession =
    session?.event ||
    (session?.eventId && typeof session.eventId === "object"
      ? session.eventId
      : null);
  const event = data?.event || eventFromSession || {};

  const rawTitle =
    event?.name ||
    event?.nom ||
    event?.title ||
    session?.eventName ||
    session?.title ||
    data?.eventName ||
    "";
  const title = sanitizeDisplayValue(rawTitle) || "Séance";

  const poster =
    event?.poster ||
    event?.affiche ||
    event?.image ||
    session?.poster ||
    data?.poster ||
    FALLBACK_POSTER;

  const genre =
    sanitizeDisplayValue(event?.genre) ||
    sanitizeDisplayValue(event?.category) ||
    sanitizeDisplayValue(event?.type) ||
    "";

  const rawDuration = event?.duration ?? event?.duree ?? event?.runtime;
  const duration = Number.isFinite(Number(rawDuration))
    ? `${Number(rawDuration)} min`
    : sanitizeDisplayValue(rawDuration);

  const rawDate = session?.date || data?.date;
  const date = formatDisplayDate(rawDate);
  const time = session?.sessionTime || session?.time || data?.sessionTime || "";

  const rawRoom =
    session?.room?.name ||
    session?.roomName ||
    session?.room ||
    data?.room ||
    "";
  const room = sanitizeDisplayValue(rawRoom);

  const eventId =
    event?._id ||
    event?.id ||
    (typeof session?.eventId === "string" ? session.eventId : "") ||
    (typeof data?.eventId === "string" ? data.eventId : "");

  return {
    title,
    poster,
    genre,
    duration,
    date,
    time,
    room,
    eventId: String(eventId || ""),
  };
};

export const resolvePricingItems = (data) => {
  const session = data?.session || data?.seance || data || {};
  const limits = Array.isArray(session?.pricingLimits)
    ? session.pricingLimits
    : Array.isArray(data?.pricingLimits)
      ? data.pricingLimits
      : [];

  if (!limits.length) {
    return [];
  }

  return limits
    .map((limit) => {
      const pricingSource =
        (limit?.pricingId && typeof limit.pricingId === "object"
          ? limit.pricingId
          : null) ||
        limit?.pricing ||
        limit?.tarif ||
        {};

      const name =
        pricingSource?.name ||
        pricingSource?.nom ||
        limit?.name ||
        limit?.label ||
        "";
      const price = pricingSource?.price ?? limit?.price ?? null;
      const maxTickets = toNonNegativeIntegerOrNull(limit?.maxTickets, null);
      const soldCount = toNonNegativeIntegerOrNull(limit?.soldCount, 0);
      const remainingTickets =
        maxTickets === null ? null : Math.max(maxTickets - soldCount, 0);
      const isAvailable = remainingTickets === null || remainingTickets > 0;
      const id =
        pricingSource?._id ??
        pricingSource?.id ??
        (typeof limit?.pricingId === "string" ? limit.pricingId : null) ??
        limit?._id ??
        limit?.id ??
        name;

      if (!name && price === null) {
        return null;
      }

      return {
        id: String(id || name),
        name: name || "Tarif",
        price,
        maxTickets,
        soldCount,
        remainingTickets,
        isAvailable,
      };
    })
    .filter(Boolean);
};

export const resolvePricingOverrides = (data) => {
  const session = data?.session || data?.seance || data || {};

  return [
    ...(Array.isArray(data?.pricingOverrides) ? data.pricingOverrides : []),
    ...(Array.isArray(session?.pricingOverrides) ? session.pricingOverrides : []),
    ...(Array.isArray(session?.room?.pricingOverrides)
      ? session.room.pricingOverrides
      : []),
    ...(Array.isArray(data?.room?.pricingOverrides)
      ? data.room.pricingOverrides
      : []),
  ];
};

export const buildOverrideMap = (pricingOverrides = [], seatKeyResolver) => {
  const map = new Map();

  pricingOverrides.forEach((override) => {
    if (!override) {
      return;
    }

    const rowValue = override?.row ?? override?.rowValue ?? override?.seatRow;
    const colValue = override?.col ?? override?.seatCol ?? override?.column;

    if (rowValue === undefined || rowValue === null) {
      return;
    }

    const colNumber = Number(colValue);
    if (!Number.isFinite(colNumber)) {
      return;
    }

    const rawOverride =
      override?.pricingId ??
      override?.pricing ??
      override?.tarif ??
      override?.pricingOverride ??
      override?.pricingOverrideId ??
      override;

    const meta = normalizeOverrideMeta(rawOverride);
    if (!meta) {
      return;
    }

    map.set(seatKeyResolver(rowValue, colNumber), meta);
  });

  return map;
};

export const resolveSeatOverride = (seat, overrideMap, seatKeyResolver) => {
  if (!seat) {
    return null;
  }

  const seatLevelOverride =
    normalizeOverrideMeta(seat?.pricingOverride) ||
    normalizeOverrideMeta(seat?.pricingOverrideId);
  const mapOverride = overrideMap.get(seatKeyResolver(seat.row, seat.col));

  if (!seatLevelOverride && !mapOverride) {
    return null;
  }

  return {
    id: seatLevelOverride?.id || mapOverride?.id || "",
    name: seatLevelOverride?.name || mapOverride?.name || "Tarif fixe",
    price: seatLevelOverride?.price ?? mapOverride?.price ?? null,
  };
};
