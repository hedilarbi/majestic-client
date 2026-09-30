import Image from "next/image";

import {
  formatActualiteDate,
  getActualiteDetailImage,
  getActualiteSummary,
} from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";
import ActualiteArticleGallery from "./ActualiteArticleGallery";

export default function ActualiteArticleCard({ item }) {
  const coverImage = getActualiteDetailImage(item);
  const summary = getActualiteSummary(item);
  const hasAlbum = Array.isArray(item.images) && item.images.length > 0;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">

      {/* Banner image */}
      {coverImage ? (
        <div className="relative h-64 w-full sm:h-80 lg:h-105 bg-black/40">
          <Image
            src={coverImage}
            alt={item.title || "Actualité"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      ) : null}

      {/* Titre + meta */}
      <div className="px-6 pt-8 sm:px-10 sm:pt-10">
        <div className="flex flex-wrap items-center gap-3">
          <ActualiteTypeBadge type={item.type} />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            {formatActualiteDate(item.createdAt)}
          </span>
        </div>
        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl font-display">
          {item.title}
        </h1>
        {summary ? (
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60 sm:text-lg font-body">
            {summary}
          </p>
        ) : null}
      </div>

      {/* Contenu */}
      <div className={`grid gap-10 px-6 pb-10 pt-8 sm:px-10 sm:pb-12 ${hasAlbum ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]" : ""}`}>
        <div
          className="prose prose-invert min-w-0 max-w-none wrap-anywhere text-sm leading-7 text-white/75 [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:text-white/75 [&_strong]:text-white sm:text-base"
          dangerouslySetInnerHTML={{
            __html:
              item.contentHtml ||
              (summary ? `<p>${summary}</p>` : "<p>Contenu indisponible.</p>"),
          }}
        />

        {hasAlbum ? (
          <ActualiteArticleGallery images={item.images} title={item.title} />
        ) : null}
      </div>
    </article>
  );
}
