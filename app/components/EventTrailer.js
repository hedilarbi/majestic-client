"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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

export default function EventTrailer({
  poster,
  title,
  trailerLink,
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
      <div className={`group ${className}`}>
        <Image
          src={poster}
          alt={`Affiche de ${title}`}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 78vw"
          className="object-cover"
          priority
        />

        <button
          className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity backdrop-blur-[2px] hover:bg-black/35 disabled:cursor-not-allowed disabled:bg-black/65"
          type="button"
          aria-label="Lire la bande annonce"
          onClick={() => hasTrailer && setIsOpen(true)}
          disabled={!hasTrailer}
        >
          <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-white/20 bg-accent text-black shadow-[0_0_24px_rgba(116,208,241,0.45)] transition-transform duration-200 group-hover:scale-105">
            <MdPlayArrow className="h-10 w-10 translate-x-[1px]" />
          </span>
        </button>

        {!hasTrailer ? (
          <div className="absolute inset-x-4 bottom-4 rounded-full border border-white/10 bg-black/65 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Bande annonce indisponible
          </div>
        ) : null}
      </div>

      {isOpen && videoConfig.type !== "none"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 sm:px-6"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="relative w-[min(92vw,calc(82vh*16/9))] max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white transition hover:border-accent hover:text-accent"
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
            document.body,
          )
        : null}
    </>
  );
}
