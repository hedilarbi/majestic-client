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
  path: "/",,
  maxAge: 60 * 60 * 24, // 24 hours
};

const normalizeGuestContact = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const firstName = typeof value.firstName === "string" ? value.firstName.trim() : "";
  const lastName = typeof value.lastName === "string" ? value.lastName.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";

  if (!firstName && !lastName && !email) {
    return null;
  }

  return { firstName, lastName, email };
};

const createGuestToken = async (contact) => {
  const guestContact = normalizeGuestContact(contact);
  const response = await fetch(new URL("/guests", resolveApiBaseUrl()), {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(guestContact ? { "Content-Type": "application/json" } : {}),
    },
    body: guestContact ? JSON.stringify(guestContact) : undefined,
    cache: "no-store",
  });
  const data = await safeJson(response);
  if (!response.ok || !data?.token) {
    return "";
  }
  return data.token;
};

const buildCreateBookingRequest = ({ token, body }) =>
  fetch(new URL("/bookings", resolveApiBaseUrl()), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const body = {
    sessionId: payload?.sessionId,
    reservationId: payload?.reservationId,
    pricingSelections: payload?.pricingSelections,
    customerId: payload?.customerId,
    customerContact: payload?.customerContact,
    subscriptionCode: payload?.subscriptionCode,
    promoCode: payload?.promoCode,
    bookingSource: "web",
  };

  let token = getTokenFromRequest(request);
  let createdGuestToken = false;

  if (!token) {
    token = await createGuestToken(payload?.customerContact);
    createdGuestToken = Boolean(token);
  }

  if (!token) {
    return NextResponse.json({ message: "Token manquant" }, { status: 401 });
  }

  let response = await buildCreateBookingRequest({ token, body });
  let data = await safeJson(response);

  if (response.status === 401) {
    const fallbackToken = await createGuestToken(payload?.customerContact);
    if (fallbackToken) {
      token = fallbackToken;
      createdGuestToken = true;
      response = await buildCreateBookingRequest({ token, body });
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
