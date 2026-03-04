import { seatKey } from "@/app/lib/seat-utils";

export const FALLBACK_POSTER = "/images/logo.png";

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

export const fetchSeatMap = async (seanceId, { signal } = {}) => {
  const response = await fetch(`/api/seat-map/${seanceId}`, {
    signal,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

export const reserveSeats = async ({ sessionId, seats, action }) => {
  const payload = { sessionId, seats, action };
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

export const getCurrentUser = async () => {
  const response = await fetch("/api/users/me", { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return null;
  }

  return data?.user ?? null;
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
  const sessionStatus = String(
    session?.status || data?.sessionStatus || data?.seanceStatus || "",
  )
    .trim()
    .toLowerCase();

  return {
    title,
    poster,
    date,
    time,
    room,
    eventId: String(eventId || ""),
    sessionStatus,
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
      const description =
        pricingSource?.description ||
        pricingSource?.details ||
        limit?.description ||
        "";
      const price = pricingSource?.price ?? limit?.price ?? null;
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
        id: id || name,
        name: name || "Tarif",
        description,
        price,
      };
    })
    .filter(Boolean);
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

export const buildOverrideMap = (pricingOverrides = []) => {
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

    map.set(seatKey(rowValue, colNumber), meta);
  });

  return map;
};

export const resolveSeatOverride = (seat, overrideMap) => {
  if (!seat) {
    return null;
  }

  const seatLevelOverride =
    normalizeOverrideMeta(seat?.pricingOverride) ||
    normalizeOverrideMeta(seat?.pricingOverrideId);
  const mapOverride = overrideMap.get(seatKey(seat.row, seat.col));

  if (!seatLevelOverride && !mapOverride) {
    return null;
  }

  return {
    id: seatLevelOverride?.id || mapOverride?.id || "",
    name: seatLevelOverride?.name || mapOverride?.name || "Tarif fixe",
    price: seatLevelOverride?.price ?? mapOverride?.price ?? null,
  };
};

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

export const sortSeatLabels = (seats = []) => {
  return seats
    .filter((seat) => seat && seat.row !== undefined && seat.col !== undefined)
    .slice()
    .sort((a, b) => {
      const rowA = String(a.row);
      const rowB = String(b.row);
      if (rowA !== rowB) {
        return rowA.localeCompare(rowB, "fr", { numeric: true });
      }
      return Number(a.col) - Number(b.col);
    })
    .map((seat) => `${seat.row}${seat.col}`);
};

export const toSeatKeySet = (seats = []) =>
  new Set(
    seats
      .filter((seat) => seat && seat.row !== undefined && seat.col !== undefined)
      .map((seat) => seatKey(seat.row, seat.col)),
  );
