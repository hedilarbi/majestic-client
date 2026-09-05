import { NextResponse } from "next/server";

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
  } catch (error) {
    return null;
  }
};

const getTokenFromRequest = (request) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get("token")?.value || "";
};

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};

const createGuestToken = async () => {
  const response = await fetch(new URL("/guests", resolveApiBaseUrl()), {
    method: "POST",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const data = await safeJson(response);
  if (!response.ok || !data?.token) {
    return "";
  }
  return data.token;
};

const buildDeleteRequest = ({ token, reservationId }) =>
  fetch(new URL(`/reservations/${reservationId}`, resolveApiBaseUrl()), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

export async function DELETE(request, { params }) {
  const { reservationId } = (await params) || {};

  if (!reservationId) {
    return NextResponse.json({ message: "Réservation invalide" }, { status: 400 });
  }

  let token = getTokenFromRequest(request);
  let createdGuestToken = false;
  if (!token) {
    token = await createGuestToken();
    createdGuestToken = Boolean(token);
  }

  if (!token) {
    return NextResponse.json({ message: "Token manquant" }, { status: 401 });
  }

  let response = await buildDeleteRequest({ token, reservationId });
  let data = await safeJson(response);

  if (response.status === 401) {
    const fallbackToken = await createGuestToken();
    if (fallbackToken) {
      token = fallbackToken;
      createdGuestToken = true;
      response = await buildDeleteRequest({ token, reservationId });
      data = await safeJson(response);
    }
  }

  if (!response.ok) {
    const errorResponse = NextResponse.json(
      { message: data?.message || "Erreur serveur" },
      { status: response.status },
    );
    if (createdGuestToken) {
      errorResponse.cookies.set("token", token, TOKEN_COOKIE_OPTIONS);
    }
    return errorResponse;
  }

  const successResponse = NextResponse.json(data || {});
  if (createdGuestToken) {
    successResponse.cookies.set("token", token, TOKEN_COOKIE_OPTIONS);
  }
  return successResponse;
}
