"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdPlayArrow } from "react-icons/md";

const parseStartSeconds = (value) => {
  if (!value) return 0;
  const cleaned = String(value).trim();
  if (!cleaned) return 0;
  if (/^\d+$/.test(cleaned)) return Number(cleaned);
  const match = cleaned.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const getYouTubeMeta = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const start = parseStartSeconds(
        parsed.searchParams.get("t") || parsed.searchParams.get("start")
      );
      return {
        id: parsed.pathname.replace("/", ""),
        start,
      };
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return {
          id: parsed.pathname.replace("/embed/", ""),
          start: parseStartSeconds(
            parsed.searchParams.get("start") || parsed.searchParams.get("t")
          ),
        };
      }
      return {
        id: parsed.searchParams.get("v"),
        start: parseStartSeconds(
          parsed.searchParams.get("t") || parsed.searchParams.get("start")
        ),
      };
    }
  } catch {
    return null;
  }
  return null;
};

const isVideoFile = (url) => /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);

export default function TrailerModalButton({
  trailerLink,
  title,
  label = "Voir trailer",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const trimmedTrailer = trailerLink?.trim() || "";
  const hasTrailer = Boolean(trimmedTrailer);

  const videoConfig = useMemo(() => {
    if (!hasTrailer) return { type: "none", src: "" };
    const youtubeMeta = getYouTubeMeta(trimmedTrailer);
    if (youtubeMeta?.id) {
      const params = new URLSearchParams({ autoplay: "1", rel: "0" });
      if (youtubeMeta.start) {
        params.set("start", String(youtubeMeta.start));
      }
      return {
        type: "youtube",
        src: `https://www.youtube.com/embed/${
          youtubeMeta.id
        }?${params.toString()}`,
      };
    }
    if (isVideoFile(trimmedTrailer)) {
      return { type: "video", src: trimmedTrailer };
    }
    return { type: "iframe", src: trimmedTrailer };
  }, [hasTrailer, trimmedTrailer]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={[
          className ||
            "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all font-display",
          hasTrailer
            ? "border-accent/40 text-white/80 hover:border-accent hover:text-accent"
            : "cursor-not-allowed border-white/10 text-white/30 opacity-60",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => hasTrailer && setIsOpen(true)}
        disabled={!hasTrailer}
      >
        <MdPlayArrow className="h-4 w-4" />
        {label}
      </button>

      {isOpen && videoConfig.type !== "none"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 sm:px-6"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="relative w-[min(90vw,calc(80vh*16/9))] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent"
                  type="button"
                  aria-label="Fermer la bande annonce"
                  onClick={() => setIsOpen(false)}
                >
                  <MdClose className="h-5 w-5" />
                </button>
                <div className="aspect-video w-full bg-black">
                  {videoConfig.type === "video" ? (
                    <video
                      className="h-full w-full"
                      controls
                      autoPlay
                      playsInline
                      src={videoConfig.src}
                    >
                      Votre navigateur ne prend pas en charge la lecture vidéo.
                    </video>
                  ) : (
                    <iframe
                      className="h-full w-full"
                      src={videoConfig.src}
                      title={`Bande annonce ${title}`}
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
