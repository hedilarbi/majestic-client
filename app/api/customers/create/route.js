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

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const token = getTokenFromRequest(request);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(
    new URL("/customers/create", resolveApiBaseUrl()),
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  const data = await safeJson(response);
  if (!response.ok) {
    return NextResponse.json(
      { message: data?.message || "Erreur serveur" },
      { status: response.status },
    );
  }

  const result = NextResponse.json({ user: data?.user || null });
  if (data?.token) {
    result.cookies.set("token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return result;
}
