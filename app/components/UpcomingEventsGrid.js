"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const getVisibilityClass = (index, rows) => {
  if (index < rows * 2) return "block";
  if (index < rows * 3) return "hidden md:block";
  if (index < rows * 4) return "hidden lg:block";
  if (index < rows * 5) return "hidden xl:block";
  return "hidden";
};

export default function UpcomingEventsGrid({ items = [], paginated = false }) {
  const [visibleRows, setVisibleRows] = useState(2);
  const rows = paginated ? visibleRows : Number.POSITIVE_INFINITY;

  return (
    <>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((movie, index) => (
          <Link
            key={movie.id ?? movie.title}
            href={`/evenements/${movie.id}`}
            className={`group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,52,166,0.4)] ${getVisibilityClass(index, rows)}`}
          >
            <div className="relative aspect-2/3 w-full overflow-hidden rounded-t-xl">
              <Image
                src={movie.image}
                alt={movie.imageAlt}
                fill
                sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 w-full translate-y-2 p-4 transition-transform duration-300 group-hover:translate-y-0">
                <h3 className="text-lg font-semibold leading-tight text-white drop-shadow-md font-display">
                  {movie.title}
                </h3>
                <div className="mt-1 line-clamp-1 text-xs text-white/70 font-body">
                  {movie.meta || movie.description || "Prochainement"}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-black shadow-[0_0_20px_rgba(116,208,241,0.45)] font-display">
                  Réserver
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {paginated ? (
        <div className="mt-10 flex justify-center">
          {items.length > visibleRows * 2 ? (
            <button
              type="button"
              onClick={() => setVisibleRows((current) => current + 2)}
              className="inline-flex rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:-translate-y-0.5 hover:brightness-110 md:hidden"
            >
              Afficher plus
            </button>
          ) : null}
          {items.length > visibleRows * 3 ? (
            <button
              type="button"
              onClick={() => setVisibleRows((current) => current + 2)}
              className="hidden rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:-translate-y-0.5 hover:brightness-110 md:inline-flex lg:hidden"
            >
              Afficher plus
            </button>
          ) : null}
          {items.length > visibleRows * 4 ? (
            <button
              type="button"
              onClick={() => setVisibleRows((current) => current + 2)}
              className="hidden rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:-translate-y-0.5 hover:brightness-110 lg:inline-flex xl:hidden"
            >
              Afficher plus
            </button>
          ) : null}
          {items.length > visibleRows * 5 ? (
            <button
              type="button"
              onClick={() => setVisibleRows((current) => current + 2)}
              className="hidden rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:-translate-y-0.5 hover:brightness-110 xl:inline-flex"
            >
              Afficher plus
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
