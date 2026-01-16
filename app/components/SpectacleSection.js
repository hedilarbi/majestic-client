import Image from "next/image";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export default function SpectacleSection({ items = [] }) {
  if (!items.length) return null;

  return (
    <section id="spectacles" className="w-full bg-transparent py-16">
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-white font-display">
              <span className="block h-8 w-1 rounded-full bg-primary" />
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
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">
          {items.map((show) => (
            <article
              key={show.id ?? show.title}
              className="group relative flex-none w-[280px] snap-start overflow-hidden rounded-xl aspect-[2/3] cursor-pointer transition-all duration-300 hover:-translate-y-2"
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
                <button className="flex w-full translate-y-4 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white opacity-0 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Réserver
                  <MdArrowForward className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
