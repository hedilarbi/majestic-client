"use client";

import { useState } from "react";
import Image from "next/image";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const IMAGES_PER_PAGE = 4;

export default function ActualiteArticleGallery({ images = [], title = "Actualité" }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const pages = Array.from(
    { length: Math.ceil(safeImages.length / IMAGES_PER_PAGE) },
    (_, index) => safeImages.slice(index * IMAGES_PER_PAGE, (index + 1) * IMAGES_PER_PAGE),
  );
  const [activePage, setActivePage] = useState(0);

  if (!safeImages.length) return null;

  const goToPreviousPage = () => {
    setActivePage((current) => Math.max(0, current - 1));
  };

  const goToNextPage = () => {
    setActivePage((current) => Math.min(pages.length - 1, current + 1));
  };

  return (
    <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Photos
          </p>
          <p className="mt-1 text-xs text-white/45">
            {safeImages.length} image{safeImages.length > 1 ? "s" : ""}
          </p>
        </div>

        {pages.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={activePage === 0}
              aria-label="Afficher les photos précédentes"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
            >
              <MdArrowBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={activePage === pages.length - 1}
              aria-label="Afficher les photos suivantes"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
            >
              <MdArrowForward className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={`gallery-page-${pageIndex}`}
              className={`grid min-w-full gap-3 ${page.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {page.map((src, imageIndex) => {
                const absoluteIndex = pageIndex * IMAGES_PER_PAGE + imageIndex;
                return (
                  <a
                    key={`${src}-${absoluteIndex}`}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/30"
                    aria-label={`Ouvrir la photo ${absoluteIndex + 1} de ${title}`}
                  >
                    <Image
                      src={src}
                      alt={`${title} — photo ${absoluteIndex + 1}`}
                      fill
                      sizes="(min-width: 1024px) 200px, 45vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm">
                      {absoluteIndex + 1}
                    </span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 ? (
        <div className="mt-4 flex justify-center gap-1.5">
          {pages.map((_, index) => (
            <button
              key={`gallery-dot-${index}`}
              type="button"
              onClick={() => setActivePage(index)}
              aria-label={`Afficher le groupe de photos ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                index === activePage ? "w-7 bg-accent" : "w-2 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
        </div>
      ) : null}
    </aside>
  );
}
