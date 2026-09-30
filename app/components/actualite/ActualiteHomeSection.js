import Image from "next/image";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";

import {
  formatActualiteDate,
  getActualiteCardImage,
  getActualiteHref,
  getActualiteSummary,
} from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";

export default function ActualiteHomeSection({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="relative w-full border-t border-white/5 py-14">
      <div className="mx-auto px-4 sm:px-8 lg:px-20">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold uppercase tracking-wide text-white md:text-3xl font-display">
              Actualités
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
              Retrouvez les derniers articles, bandes-annonces et formulaires
              publiés par Le Majestic.
            </p>
          </div>
          <Link
            href="/actualite"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-accent transition hover:brightness-110"
          >
            Voir tout
            <RiArrowRightLine className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={getActualiteHref(item)}
              className="group block h-full overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-primary/30 hover:bg-white/[0.07]"
            >
              <article className="flex h-full flex-col">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={getActualiteCardImage(item)}
                    alt={item.title || "Actualité"}
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="flex h-64 flex-col gap-4 p-6">
                  <div className="flex h-7 shrink-0 items-center gap-3 overflow-hidden">
                    <ActualiteTypeBadge type={item.type} />
                    <span className="truncate whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                      {formatActualiteDate(item.createdAt)}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 min-h-12 text-xl font-semibold text-white font-display transition group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-7 text-white/60">
                    {getActualiteSummary(item)}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
