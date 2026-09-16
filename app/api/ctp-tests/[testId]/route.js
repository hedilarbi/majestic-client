import { NextResponse } from "next/server";

const getBaseUrl = () => process.env.API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

// Secret partagé côté serveur uniquement (jamais envoyé au navigateur).
const CTP_TEST_SECRET = process.env.CTP_TEST_SECRET || "majestic-ctp-recette-2026";

export async function POST(req, { params }) {
  const { testId } = await params;

  try {
    const response = await fetch(`${getBaseUrl()}/ctp-tests/${testId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ctp-Test-Secret": CTP_TEST_SECRET,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/ctp-tests] error:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'exécution du test." },
      { status: 500 }
    );
  }
}
