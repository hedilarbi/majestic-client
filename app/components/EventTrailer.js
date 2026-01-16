"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MdPlayArrow } from "react-icons/md";

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
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <div className={`group ${className}`}>
      {isPlaying && videoConfig.type !== "none" ? (
        <>
          <button
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent"
            type="button"
            aria-label="Fermer la bande annonce"
            onClick={() => setIsPlaying(false)}
          >
            X
          </button>
          {videoConfig.type === "video" ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              controls
              autoPlay
              playsInline
              src={videoConfig.src}
            >
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          ) : (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={videoConfig.src}
              title={`Bande annonce ${title}`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </>
      ) : (
        <>
          <Image
            src={poster}
            alt={`Affiche de ${title}`}
            fill
            sizes="(min-width: 1024px) 45vw, (min-width: 768px) 55vw, 90vw"
            className="object-cover"
            priority
          />
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity backdrop-blur-[2px] group-hover:opacity-100"
            type="button"
            aria-label="Lire la bande annonce"
            onClick={() => setIsPlaying(true)}
            disabled={!hasTrailer}
          >
            <span className="rounded-full bg-linear-to-r from-primary to-accent p-3 text-white shadow-[0_0_15px_rgba(16,52,166,0.5),0_0_5px_rgba(116,208,241,0.3)] transition-transform hover:scale-100 scale-90">
              <MdPlayArrow className="h-8 w-8" />
            </span>
          </button>
        </>
      )}
    </div>
  );
}
