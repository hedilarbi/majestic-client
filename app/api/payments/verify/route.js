import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const getBaseUrl = () => process.env.API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ message: "orderId manquant." }, { status: 400 });
    }

    // Forward the auth token if present (optional — server route is public)
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const response = await fetch(`${getBaseUrl()}/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/payments/verify] error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification du paiement." },
      { status: 500 }
    );
  }
}
