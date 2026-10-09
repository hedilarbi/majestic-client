import Image from "next/image";
import Link from "next/link";
import { RiExternalLinkLine, RiPlayCircleLine } from "react-icons/ri";

import {
  formatActualitePublishedDate,
  getActualiteDetailImage,
  getActualiteSummary,
  getVideoEmbedUrl,
} from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";

export default function ActualiteTrailerCard({ item }) {
  const embedUrl = getVideoEmbedUrl(item.videoUrl);
  const coverImage = getActualiteDetailImage(item);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      {/* Banner image */}
      {coverImage ? (
        <div className="relative h-64 w-full sm:h-80 lg:h-105 bg-black/40">
          <Image
            src={coverImage}
            alt={item.title || "Vidéo"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      ) : null}

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <ActualiteTypeBadge type={item.type} />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            {formatActualitePublishedDate(item.createdAt)}
          </span>
        </div>

        <div className="mt-5 min-w-0">
          <div className="min-w-0 overflow-hidden">
            <h2 className="wrap-break-word text-2xl font-semibold text-white sm:text-3xl font-display">
              {item.title}
            </h2>
            <p className="mt-4 max-w-2xl wrap-anywhere text-sm leading-7 text-white/65 sm:text-base">
              {getActualiteSummary(item)}
            </p>

            {item.contentHtml ? (
              <div
                className="prose prose-invert mt-6 max-w-none wrap-anywhere text-sm leading-7 text-white/75 [&_a]:text-accent [&_a]:underline [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:text-white/75 sm:text-base"
                dangerouslySetInnerHTML={{ __html: item.contentHtml }}
              />
            ) : null}

            {embedUrl ? (
              <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/50">
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={item.title || "Vidéo"}
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
                {/youtu\.?be/i.test(item.videoUrl)
                  ? "Voir la vidéo sur YouTube"
                  : "Voir la vidéo"}
                <RiExternalLinkLine className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
