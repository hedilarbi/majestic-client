import { NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim() || q.trim().length < 2) {
    return NextResponse.json({ events: [], articles: [] });
  }

  try {
    const response = await fetch(
      `${resolveApiBaseUrl()}/search?q=${encodeURIComponent(q.trim())}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json({
      events: Array.isArray(data?.events) ? data.events : [],
      articles: Array.isArray(data?.articles) ? data.articles : [],
    });
  } catch {
    return NextResponse.json({ events: [], articles: [] }, { status: 500 });
  }
}
