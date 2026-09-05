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
  path: "/",,
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

export async function GET(request) {
  let token = getTokenFromRequest(request);
  let createdGuestToken = false;

  if (!token) {
    token = await createGuestToken();
    createdGuestToken = Boolean(token);
  }

  if (!token) {
    return NextResponse.json({ message: "Token manquant" }, { status: 401 });
  }

  let response = await fetch(new URL("/users/me", resolveApiBaseUrl()), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  let data = await safeJson(response);

  if (response.status === 401) {
    const fallbackToken = await createGuestToken();
    if (fallbackToken) {
      token = fallbackToken;
      createdGuestToken = true;
      response = await fetch(new URL("/users/me", resolveApiBaseUrl()), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
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

  if (process.env.NODE_ENV !== "production") {
    console.log("[users/me] user", data?.user || null);
  }

  const successResponse = NextResponse.json({ user: data?.user || null });
  if (createdGuestToken) {
    successResponse.cookies.set("token", token, TOKEN_COOKIE_OPTIONS);
  }
  return successResponse;
}
