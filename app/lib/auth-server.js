import "server-only";

import { cookies } from "next/headers";

const DEFAULT_API_BASE_URL = "http://localhost:5000";
const TOKEN_COOKIE = "token";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

const buildUrl = (path) => new URL(path, resolveApiBaseUrl()).toString();

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const buildError = (response, data) => {
  const message = data?.message || "Erreur serveur";
  const error = new Error(message);
  error.status = response.status;
  return error;
};

export const setTokenCookie = async (token) => {
  if (!token) return;
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

export const getTokenCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value || null;
};

export const clearTokenCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
};

export const signupCustomer = async (payload) => {
  const response = await fetch(buildUrl("/customers/create"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw buildError(response, data);
  }

  return data;
};

export const getCustomerMe = async (token) => {
  const response = await fetch(buildUrl("/users/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await safeJson(response);

  if (!response.ok) {
    throw buildError(response, data);
  }

  return data;
};
