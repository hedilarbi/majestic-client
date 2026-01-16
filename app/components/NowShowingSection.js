import Image from "next/image";
import Link from "next/link";
import { MdArrowForward } from "react-icons/md";

const badgeStyles = {
  primary: "bg-primary text-white",
  accent: "bg-accent text-black",
};

export default function NowShowingSection({ items = [], showCta = true }) {
  if (!items.length) return null;

  return (
    <section
      id="films"
      className="relative w-full border-b border-white/5 bg-transparent py-12"
    >
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h2 className="text-2xl font-semibold uppercase tracking-wide text-white md:text-3xl font-display">
              À l&apos;affiche
            </h2>
            <p className="mt-2 text-white/60 font-body">
              Ne manquez pas les plus grands succès de la saison
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-primary/40 font-display">
              Tous
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
          {items.map((movie) => {
            const badgeClass =
              badgeStyles[movie.badgeTone] ?? badgeStyles.primary;

            return (
              <Link
                key={movie.id ?? movie.title}
                className="group relative block"
                href={`/evenements/${movie.id}`}
                aria-label={`Voir ${movie.title}`}
              >
                <article className="cursor-pointer">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg shadow-black/50">
                    <Image
                      src={movie.mobileImage || movie.image}
                      alt={movie.imageAlt}
                      fill
                      sizes="45vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110 sm:hidden"
                    />
                    <Image
                      src={movie.image}
                      alt={movie.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 18vw, (min-width: 768px) 22vw, 45vw"
                      className="hidden object-cover transition-transform duration-500 group-hover:scale-110 sm:block"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
                    {movie.badge ? (
                      <div
                        className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-md font-display ${badgeClass}`}
                      >
                        {movie.badge}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-lg font-semibold leading-tight text-white transition-colors group-hover:text-accent font-display">
                      {movie.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/50 font-body">
                      {movie.meta}
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
        {showCta ? (
          <div className="mt-10 flex justify-center">
            <Link
              className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white font-display"
              href="/cinema"
            >
              Voir tout le programme
              <MdArrowForward className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
