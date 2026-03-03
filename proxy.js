import { NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

const isHtmlRequest = (request) => {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
};

export async function proxy(request) {
  if (request.method !== "GET" || !isHtmlRequest(request)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (token) {
    try {
      const response = await fetch(new URL("/users/me", resolveApiBaseUrl()), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.next();
      }
    } catch (error) {
      // If validation fails, fall back to guest creation below.
    }
  }

  try {
    const response = await fetch(new URL("/guests", resolveApiBaseUrl()), {
      method: "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.token) {
      return NextResponse.next();
    }

    const nextResponse = NextResponse.next();
    nextResponse.cookies.set("token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return nextResponse;
  } catch (error) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
