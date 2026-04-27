import Image from "next/image";
import Link from "next/link";
import { RiPlayCircleLine } from "react-icons/ri";

import {
  formatActualiteDate,
  getActualiteCoverImage,
  getActualiteSummary,
  getVideoEmbedUrl,
} from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";

export default function ActualiteTrailerCard({ item }) {
  const embedUrl = getVideoEmbedUrl(item.videoUrl);
  const coverImage = getActualiteCoverImage(item);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <ActualiteTypeBadge type={item.type} />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            {formatActualiteDate(item.createdAt)}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl font-display">
              {item.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              {getActualiteSummary(item)}
            </p>

            {embedUrl ? (
              <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/50">
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={item.title || "Bande-annonce"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-[1.6rem] border border-dashed border-white/15 bg-black/30 px-5 py-5 text-sm text-white/65">
                L’intégration vidéo n’est pas disponible pour cette URL.
              </div>
            )}

            {item.videoUrl ? (
              <Link
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black transition hover:brightness-110"
              >
                <RiPlayCircleLine className="h-4 w-4" />
                Ouvrir la vidéo
              </Link>
            ) : null}
          </div>

          <div className="relative min-h-[240px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/40">
            <Image
              src={coverImage}
              alt={item.title || "Bande-annonce"}
              fill
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </article>
  );
}
