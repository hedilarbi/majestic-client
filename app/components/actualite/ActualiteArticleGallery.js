"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdArrowBack, MdArrowForward, MdClose } from "react-icons/md";

const IMAGES_PER_PAGE = 4;

export default function ActualiteArticleGallery({ images = [], title = "Actualité" }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const pages = Array.from(
    { length: Math.ceil(safeImages.length / IMAGES_PER_PAGE) },
    (_, index) => safeImages.slice(index * IMAGES_PER_PAGE, (index + 1) * IMAGES_PER_PAGE),
  );
  const [activePage, setActivePage] = useState(0);
  // Photo shown in the in-page viewer (null = closed). Photos no longer open
  // in a new tab (C20).
  const [viewerIndex, setViewerIndex] = useState(null);
  const isViewerOpen = viewerIndex !== null;
  const imageCount = safeImages.length;

  const closeViewer = useCallback(() => setViewerIndex(null), []);
  const showPreviousPhoto = useCallback(() => {
    setViewerIndex((current) =>
      current === null ? current : (current - 1 + imageCount) % imageCount,
    );
  }, [imageCount]);
  const showNextPhoto = useCallback(() => {
    setViewerIndex((current) =>
      current === null ? current : (current + 1) % imageCount,
    );
  }, [imageCount]);

  useEffect(() => {
    if (!isViewerOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPreviousPhoto();
      if (event.key === "ArrowRight") showNextPhoto();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeViewer, isViewerOpen, showNextPhoto, showPreviousPhoto]);

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
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
          Photos
        </p>

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
              className="flex min-w-full flex-wrap content-start items-start gap-3"
            >
              {page.map((src, imageIndex) => {
                const absoluteIndex = pageIndex * IMAGES_PER_PAGE + imageIndex;
                return (
                  <button
                    type="button"
                    key={`${src}-${absoluteIndex}`}
                    onClick={() => setViewerIndex(absoluteIndex)}
                    className="group relative flex max-w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30"
                    aria-label={`Agrandir la photo ${absoluteIndex + 1} de ${title}`}
                  >
                    {/* The browser keeps the source image's intrinsic aspect ratio. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${title} — photo ${absoluteIndex + 1}`}
                      loading="lazy"
                      className="block h-auto max-h-[360px] w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02] sm:max-h-[420px]"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  </button>
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

      {isViewerOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6"
              role="dialog"
              aria-modal="true"
              aria-label={`Photo ${viewerIndex + 1} sur ${safeImages.length}`}
              onClick={closeViewer}
            >
              <button
                type="button"
                onClick={closeViewer}
                aria-label="Fermer la photo"
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent"
              >
                <MdClose className="h-5 w-5" />
              </button>
              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      showPreviousPhoto();
                    }}
                    aria-label="Photo précédente"
                    className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent sm:left-6"
                  >
                    <MdArrowBack className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNextPhoto();
                    }}
                    aria-label="Photo suivante"
                    className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent sm:right-6"
                  >
                    <MdArrowForward className="h-5 w-5" />
                  </button>
                </>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeImages[viewerIndex]}
                alt={`${title} — photo ${viewerIndex + 1}`}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/60">
                {viewerIndex + 1} / {safeImages.length}
              </p>
            </div>,
            document.body,
          )
        : null}
    </aside>
  );
}
