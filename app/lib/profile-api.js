import "server-only";

import { getTokenCookie } from "./auth-server";

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

const fetchWithCustomerToken = async (path, { page, limit } = {}) => {
  const token = await getTokenCookie();
  if (!token) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: limit || 50,
      error: "Vous devez etre connecte.",
      status: 401,
    };
  }

  const params = new URLSearchParams();
  if (page) {
    params.set("page", String(page));
  }
  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(
    `${resolveApiBaseUrl()}${path}${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const data = await safeJson(response);

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number.isFinite(data?.total) ? data.total : 0,
    page: Number.isFinite(data?.page) ? data.page : page || 1,
    limit: Number.isFinite(data?.limit) ? data.limit : limit || 50,
    error: response.ok ? "" : data?.message || "Erreur serveur",
    status: response.status,
  };
};

const fetchSingleWithCustomerToken = async (path, { key = "item" } = {}) => {
  const token = await getTokenCookie();
  if (!token) {
    return {
      [key]: null,
      error: "Vous devez etre connecte.",
      status: 401,
    };
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await safeJson(response);

  return {
    [key]: data?.[key] || null,
    error: response.ok ? "" : data?.message || "Erreur serveur",
    status: response.status,
  };
};

export const getProfileBookings = async ({ page, limit } = {}) =>
  fetchWithCustomerToken("/users/me/bookings", { page, limit });

export const getProfileTickets = async ({ page, limit } = {}) =>
  fetchWithCustomerToken("/users/me/tickets", { page, limit });

export const getProfileSubscriptionSales = async ({ page, limit } = {}) =>
  fetchWithCustomerToken("/users/me/subscription-sales", { page, limit });

export const getProfileSubscriptionSaleById = async (saleId) => {
  if (!saleId) {
    return { sale: null, error: "Vente abonnement invalide.", status: 400 };
  }

  return fetchSingleWithCustomerToken(
    `/users/me/subscription-sales/${encodeURIComponent(String(saleId))}`,
    { key: "sale" },
  );
};

export const getProfilePayments = async ({ page, limit } = {}) =>
  fetchWithCustomerToken("/users/me/payments", { page, limit });
