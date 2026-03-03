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
  } catch (_error) {
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

const buildReservationDetailsRequest = ({ token, seanceId }) =>
  fetch(new URL(`/reservations/session/${seanceId}/me`, resolveApiBaseUrl()), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

export async function GET(request, { params }) {
  const { seanceId } = (await params) || {};

  if (!seanceId) {
    return NextResponse.json({ message: "Seance invalide" }, { status: 400 });
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

  let response = await buildReservationDetailsRequest({ token, seanceId });
  let data = await safeJson(response);

  if (response.status === 401) {
    const fallbackToken = await createGuestToken();
    if (fallbackToken) {
      token = fallbackToken;
      createdGuestToken = true;
      response = await buildReservationDetailsRequest({ token, seanceId });
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
