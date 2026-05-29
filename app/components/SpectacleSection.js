import Image from "next/image";
import Link from "next/link";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export default function SpectacleSection({ items = [], lastExpiredItem = null }) {
  if (!items.length && !lastExpiredItem) return null;

  return (
    <section id="spectacles" className="w-full bg-transparent py-16">
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-white font-display">
              <span className="block h-8 w-1 rounded-full bg-accent" />
              Spectacles
            </h2>
            <p className="mt-2 text-white/60 font-body">
              Les spectacles incontournables du moment.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              aria-label="Voir la liste précédente"
              className="rounded-full border border-white/10 p-2 text-white transition-colors hover:bg-white/5"
            >
              <MdArrowBack className="h-5 w-5" />
            </button>
            <button
              aria-label="Voir la liste suivante"
              className="rounded-full border border-white/10 p-2 text-white transition-colors hover:bg-white/5"
            >
              <MdArrowForward className="h-5 w-5" />
            </button>
          </div>
        </div>
        {!items.length && lastExpiredItem ? (
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/55 backdrop-blur-sm md:self-center">
              Aucun spectacle à l&apos;affiche en ce moment.
            </p>
            <div className="relative w-[220px] flex-none overflow-hidden rounded-xl aspect-[2/3] opacity-60">
              <Image
                src={lastExpiredItem.image}
                alt={lastExpiredItem.imageAlt}
                fill
                sizes="220px"
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                Expiré
              </span>
              <div className="absolute bottom-0 left-0 p-4">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent/70 font-display">
                  {lastExpiredItem.genre}
                </span>
                <h3 className="text-base font-semibold leading-tight text-white/80 font-display">
                  {lastExpiredItem.title}
                </h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">
            {items.map((show) => (
              <Link
                key={show.id ?? show.title}
                href={`/evenements/${show.id}`}
                className="group relative flex-none w-[280px] snap-start overflow-hidden rounded-xl aspect-[2/3] cursor-pointer transition-all duration-300 hover:-translate-y-2"
                aria-label={`Voir ${show.title}`}
              >
                <Image
                  src={show.image}
                  alt={show.imageAlt}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 flex w-full flex-col gap-2 p-6">
                  <div className="transition-transform duration-300 group-hover:-translate-y-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent font-display">
                      {show.genre}
                    </span>
                    <h3 className="text-xl font-semibold leading-tight text-white font-display">
                      {show.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/60 font-body">
                      {show.meta}
                    </p>
                  </div>
                  <span className="flex w-full translate-y-4 items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-black opacity-0 shadow-[0_0_16px_rgba(116,208,241,0.35)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Réserver
                    <MdArrowForward className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
