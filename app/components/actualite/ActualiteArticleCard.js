import Image from "next/image";

import {
  formatActualiteDate,
  getActualiteCoverImage,
  getActualiteSummary,
} from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";

export default function ActualiteArticleCard({ item }) {
  const coverImage = getActualiteCoverImage(item);
  const summary = getActualiteSummary(item);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative min-h-[280px] bg-black/40">
          <Image
            src={coverImage}
            alt={item.title || "Actualité"}
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <ActualiteTypeBadge type={item.type} />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              {formatActualiteDate(item.createdAt)}
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl font-display">
            {item.title}
          </h2>

          {summary ? (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
              {summary}
            </p>
          ) : null}

          <div
            className="mt-8 space-y-4 text-sm leading-7 text-white/75 [&_a]:text-accent [&_a]:underline [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:text-white/75 [&_strong]:text-white"
            dangerouslySetInnerHTML={{
              __html:
                item.contentHtml ||
                (summary ? `<p>${summary}</p>` : "<p>Contenu indisponible.</p>"),
            }}
          />
        </div>
      </div>
    </article>
  );
}
