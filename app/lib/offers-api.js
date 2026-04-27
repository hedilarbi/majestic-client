import "server-only";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

const isFutureDate = (value) => {
  if (!value) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.getTime() >= Date.now();
};

const normalizeSubscriptions = (items) =>
  (Array.isArray(items) ? items : []).filter(
    (item) => item && item.isActive !== false && isFutureDate(item.expirationDate),
  );

const normalizePromoCodes = (items) =>
  (Array.isArray(items) ? items : []).filter(
    (item) =>
      item &&
      item.isActive !== false &&
      item.availability !== "private" &&
      isFutureDate(item.expiresAt),
  );

export const getPublicOffers = async () => {
  const baseUrl = resolveApiBaseUrl();

  const response = await fetch(`${baseUrl}/offers`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      subscriptions: [],
      promoCodes: [],
      error: data?.message || "Impossible de charger les offres pour le moment.",
    };
  }

  return {
    subscriptions: normalizeSubscriptions(data?.subscriptions),
    promoCodes: normalizePromoCodes(data?.promoCodes),
    error: "",
  };
};

export const getPublicSubscriptionById = async (subscriptionId) => {
  if (!subscriptionId) {
    return {
      subscription: null,
      error: "Abonnement invalide.",
    };
  }

  const response = await fetch(
    `${resolveApiBaseUrl()}/subscriptions/${encodeURIComponent(String(subscriptionId))}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const data = await safeJson(response);
  if (!response.ok) {
    return {
      subscription: null,
      error: data?.message || "Abonnement introuvable.",
    };
  }

  const subscription = data?.subscription || null;
  if (!subscription) {
    return {
      subscription: null,
      error: "Abonnement introuvable.",
    };
  }

  if (subscription.isActive === false || !isFutureDate(subscription.expirationDate)) {
    return {
      subscription: null,
      error: "Cet abonnement n'est plus disponible.",
    };
  }

  return {
    subscription,
    error: "",
  };
};
