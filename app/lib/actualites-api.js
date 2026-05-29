import "server-only";

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

const normalizeQuestion = (question) => ({
  id: question?._id || question?.id || "",
  label: question?.label || "",
  type: question?.type || "text",
  required: question?.required === true,
  placeholder: question?.placeholder || "",
  helpText: question?.helpText || "",
  options: Array.isArray(question?.options)
    ? question.options.map((option) => String(option || ""))
    : [],
});

const normalizeActualiteItem = (item) => ({
  id: item?._id || item?.id || "",
  type: item?.type || "",
  title: item?.title || "",
  slug: item?.slug || "",
  excerpt: item?.excerpt || "",
  image: item?.image || "",
  images: Array.isArray(item?.images) ? item.images : [],
  contentHtml: item?.contentHtml || "",
  videoUrl: item?.videoUrl || "",
  thumbnail: item?.thumbnail || "",
  formDescription: item?.formDescription || "",
  questions: Array.isArray(item?.questions)
    ? item.questions.map(normalizeQuestion)
    : [],
  isPublished: item?.isPublished === true,
  createdAt: item?.createdAt || "",
});

const normalizeActualiteItems = (items = []) =>
  items.map(normalizeActualiteItem).filter((item) => item.isPublished);

export const getPublishedActualites = async ({ limit, type, noCache } = {}) => {
  const searchParams = new URLSearchParams();

  if (limit) {
    searchParams.set("limit", String(limit));
  }

  if (type) {
    searchParams.set("type", String(type));
  }

  const response = await fetch(
    `${resolveApiBaseUrl()}/blog-contents/public${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: noCache ? "no-store" : undefined,
      next: noCache ? undefined : { revalidate: 60, tags: ["actualites"] },
    },
  ).catch(() => null);

  if (!response) {
    return [];
  }

  const data = await safeJson(response);

  if (!response.ok) {
    return [];
  }

  return Array.isArray(data?.items) ? normalizeActualiteItems(data.items) : [];
};

export const getPublishedActualiteBySlug = async (slug, { noCache } = {}) => {
  const safeSlug = typeof slug === "string" ? slug.trim() : "";

  if (!safeSlug) {
    return null;
  }

  const response = await fetch(
    `${resolveApiBaseUrl()}/blog-contents/public/${encodeURIComponent(safeSlug)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: noCache ? "no-store" : undefined,
      next: noCache ? undefined : { revalidate: 60, tags: ["actualites"] },
    },
  ).catch(() => null);

  if (!response) {
    return null;
  }

  const data = await safeJson(response);

  if (!response.ok || !data?.item) {
    return null;
  }

  const item = normalizeActualiteItem(data.item);
  return item.isPublished ? item : null;
};
