import Image from "next/image";
import Link from "next/link";
import { MdArrowForward } from "react-icons/md";
import HomeHorizontalCarousel from "./HomeHorizontalCarousel";

const carouselItemClass =
  "w-[calc((100%_-_3rem)/2.25)] flex-none snap-start md:w-[calc((100%_-_6rem)/4.25)] xl:w-[calc((100%_-_7.5rem)/5.2)]";

const badgeStyles = {
  primary: "bg-accent text-white",
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
      <div className="mx-auto px-4 sm:px-8 lg:px-20">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h2 className="text-2xl font-semibold uppercase tracking-wide text-white md:text-3xl font-display">
              À l&apos;affiche
            </h2>
            <p className="mt-2 text-white/60 font-body">
              Ne manquez pas les plus grands succès de la saison
            </p>
          </div>
        </div>
        <HomeHorizontalCarousel label="les films à l'affiche">
          {items.map((movie) => {
            const badgeClass =
              badgeStyles[movie.badgeTone] ?? badgeStyles.primary;

            return (
              <Link
                key={movie.id ?? movie.title}
                className={`group relative block ${carouselItemClass}`}
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
                    <h3 className="text-sm font-semibold leading-tight text-white transition-colors group-hover:text-accent sm:text-lg font-display">
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
        </HomeHorizontalCarousel>
        {showCta ? (
          <div className="mt-8 flex justify-center">
            <Link
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_22px_rgba(116,208,241,0.32)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_30px_rgba(116,208,241,0.5)] active:translate-y-0 font-display"
              href="/programme"
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
