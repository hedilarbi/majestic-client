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

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));

  const response = await fetch(
    new URL("/space-reservation-requests", resolveApiBaseUrl()),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: payload?.firstName,
        lastName: payload?.lastName,
        phone: payload?.phone,
        email: payload?.email,
        establishmentType: payload?.establishmentType,
        reservationDateTime: payload?.reservationDateTime,
        description: payload?.description,
      }),
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

  return NextResponse.json(data || {}, { status: 201 });
}
