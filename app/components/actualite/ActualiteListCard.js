import Image from "next/image";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";

import {
  formatActualiteDate,
  getActualiteCoverImage,
  getActualiteHref,
  getActualiteSummary,
} from "@/app/lib/actualites-utils";

import ActualiteTypeBadge from "./ActualiteTypeBadge";

const CTA_LABELS = {
  article: "Lire l'article",
  trailer: "Voir la bande-annonce",
  form: "Ouvrir le formulaire",
};

export default function ActualiteListCard({ item }) {
  const href = getActualiteHref(item);

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition hover:border-primary/30 hover:bg-white/[0.07]"
      aria-label={item?.title ? `Ouvrir ${item.title}` : "Ouvrir l'actualité"}
    >
      <article>
        <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
          <Image
            src={getActualiteCoverImage(item)}
            alt={item?.title || "Actualité"}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <ActualiteTypeBadge type={item?.type} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              {formatActualiteDate(item?.createdAt)}
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-white font-display transition group-hover:text-accent">
            {item?.title || "Actualité"}
          </h2>

          <p className="line-clamp-4 text-sm leading-7 text-white/60">
            {getActualiteSummary(item)}
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {CTA_LABELS[item?.type] || "Voir le détail"}
            <RiArrowRightLine className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
