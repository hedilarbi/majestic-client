import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const headers = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      new URL("/promo-codes/public", resolveApiBaseUrl()),
      { headers, cache: "no-store" },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { promoCodes: [], message: data?.message || "Erreur serveur" },
        { status: response.status },
      );
    }

    return NextResponse.json({ promoCodes: data?.promoCodes || [] });
  } catch {
    return NextResponse.json({ promoCodes: [] }, { status: 500 });
  }
}
