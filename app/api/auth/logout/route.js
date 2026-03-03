import { NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("token");

  try {
    const guestResponse = await fetch(
      new URL("/guests", resolveApiBaseUrl()),
      {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    const data = await guestResponse.json().catch(() => null);
    if (guestResponse.ok && data?.token) {
      response.cookies.set("token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
  } catch (error) {
    // Ignore guest fallback errors.
  }

  return response;
}
