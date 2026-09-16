import { NextResponse } from "next/server";

const getBaseUrl = () => process.env.API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

const CTP_TEST_SECRET = process.env.CTP_TEST_SECRET || "majestic-ctp-recette-2026";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ message: "orderId manquant." }, { status: 400 });
    }

    const response = await fetch(`${getBaseUrl()}/ctp-tests/check-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ctp-Test-Secret": CTP_TEST_SECRET,
      },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/ctp-tests/check-status] error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification du statut." },
      { status: 500 }
    );
  }
}
