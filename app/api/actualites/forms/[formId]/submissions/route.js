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

export async function POST(request, { params }) {
  const token = request.cookies.get("token")?.value || "";

  const { formId } = await params;
  const payload = await request.json().catch(() => ({}));

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${resolveApiBaseUrl()}/blog-form-submissions/forms/${encodeURIComponent(
      formId,
    )}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ answers: payload?.answers || {} }),
      cache: "no-store",
    },
  );

  const data = await safeJson(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        message:
          data?.message || "L'envoi du formulaire a echoue. Merci de réessayer.",
      },
      { status: response.status },
    );
  }

  return NextResponse.json(data || {}, { status: 201 });
}
