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

export async function GET(request, { params }) {
  const { ticketId } = (await params) || {};
  const resolvedTicketId = String(ticketId || "").trim();

  if (!resolvedTicketId) {
    return NextResponse.json({ message: "Ticket invalide." }, { status: 400 });
  }

  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { message: "Vous devez être connecte." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(
      new URL(
        `/users/me/tickets/${encodeURIComponent(resolvedTicketId)}/pdf`,
        resolveApiBaseUrl(),
      ),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf, application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const data = await safeJson(response);
      return NextResponse.json(
        { message: data?.message || "Erreur serveur" },
        { status: response.status },
      );
    }

    const pdfData = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") || "application/pdf";
    const contentDisposition =
      response.headers.get("content-disposition") ||
      `attachment; filename="ticket-${resolvedTicketId}.pdf"`;

    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { message: "Impossible de telecharger le billet." },
      { status: 502 },
    );
  }
}
