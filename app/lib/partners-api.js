import "server-only";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

export const getPublicPartners = async ({ noCache } = {}) => {
  try {
    const response = await fetch(`${resolveApiBaseUrl()}/partners/public`, {
      headers: { Accept: "application/json" },
      cache: noCache ? "no-store" : undefined,
      next: noCache ? undefined : { revalidate: 300, tags: ["partners"] },
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => ({}));
    return Array.isArray(data?.partners) ? data.partners : [];
  } catch {
    return [];
  }
};
