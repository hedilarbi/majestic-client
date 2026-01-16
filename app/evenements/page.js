import Image from "next/image";
import Link from "next/link";
import GenreFilter from "../components/GenreFilter";
import TrailerModalButton from "../components/TrailerModalButton";
import { getEventsWithALaffiche } from "../lib/events-api";

const MOVIE_GENRES = [
  "Action",
  "Aventure",
  "Science-fiction",
  "Thriller",
  "Drame",
  "Horreur",
  "Romance",
  "Fantastique",
  "Crime",
  "Animation",
  "Comedie",
  "Famille",
  "Musical",
  "Historique",
];

export default async function EvenementsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const type = resolvedParams?.type === "show" ? "show" : "movie";
  const genre =
    typeof resolvedParams?.genre === "string"
      ? resolvedParams.genre
      : undefined;
  const [{ events, aLaffiche, showTypes }, allEventsResponse] =
    await Promise.all([
      getEventsWithALaffiche({ type, genre }),
      genre ? getEventsWithALaffiche({ type }) : Promise.resolve(null),
    ]);

  const allEvents = allEventsResponse?.events ?? events;
  const allShowTypes = allEventsResponse?.showTypes ?? showTypes ?? [];
  const heroEntry = aLaffiche?.[0];
  const heroEvent = heroEntry?.event || events?.[0];
  const heroImageDesktop = heroEntry?.poster || heroEvent?.image;
  const heroImageMobile = heroEvent?.image || heroEntry?.poster;
  const heroTitle = heroEvent?.title || "À l'affiche";
  const heroSubtitle =
    heroEvent?.description ||
    "Découvrez les plus grands films et expériences cinéma du moment.";
  const heroMeta = heroEvent?.meta || "Expérience cinéma premium";
  const heroEventId = heroEvent?.id;
  const heroTrailerLink = heroEvent?.trailerLink || "";
  const countLabel = type === "show" ? "spectacles" : "films";
  const ctaLabel =
    type === "show" ? "VOIR PLUS DE SPECTACLES" : "VOIR PLUS DE FILMS";
  const genres = type === "show" ? allShowTypes : MOVIE_GENRES;

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white">
      <section className="w-full px-10 py-6 sm:px-14 lg:px-20">
        <div className="group relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <div className="absolute inset-0 z-10 bg-linear-to-r from-black/90 via-black/40 to-transparent" />
          {heroImageDesktop || heroImageMobile ? (
            <>
              {heroImageMobile ? (
                <Image
                  src={heroImageMobile}
                  alt={heroTitle}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-10000 group-hover:scale-105 sm:hidden"
                />
              ) : null}
              {heroImageDesktop ? (
                <Image
                  src={heroImageDesktop}
                  alt={heroTitle}
                  fill
                  priority
                  sizes="100vw"
                  className="hidden object-cover transition-transform duration-10000 group-hover:scale-105 sm:block"
                />
              ) : null}
            </>
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}
          <div className="relative z-20 flex min-h-120 flex-col items-start justify-end gap-4 px-10 pb-12 sm:px-16 sm:pb-16 lg:px-20">
            <span className="rounded border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent font-display">
              TENDANCE
            </span>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-white drop-shadow-lg sm:text-6xl font-display">
              {heroTitle}
            </h1>
            <div className="text-sm text-white/70 sm:text-base font-body">
              {heroMeta}
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-white/70 sm:text-lg font-body">
              {heroSubtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                className="flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,52,166,0.4)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(16,52,166,0.6)] sm:h-12 sm:px-6 sm:text-base font-display"
                href={
                  heroEventId
                    ? `/evenements/${heroEventId}`
                    : `/evenements?type=${type}`
                }
              >
                Réserver
              </Link>
              <TrailerModalButton
                trailerLink={heroTrailerLink}
                title={heroTitle}
                label="Bande-annonce"
                className="flex h-11 items-center gap-2 rounded-lg border border-secondary/50 bg-secondary px-4 text-sm font-semibold text-white shadow-[0_0_12px_rgba(16,52,166,0.2)] transition-all hover:-translate-y-0.5 hover:bg-secondary/80 sm:h-12 sm:px-6 sm:text-base font-display"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-18 z-30 w-full px-10 py-2 sm:px-14 lg:px-20">
        <div className="rounded-xl border border-white/10 bg-black/70 p-4 shadow-lg backdrop-blur-lg">
          <div className="mb-4 flex flex-col items-start justify-between gap-4 md:mb-0 md:flex-row md:items-center">
            <h2 className="text-xl font-semibold text-white font-display">
              À l&apos;affiche
            </h2>
            <div className="text-sm text-white/60 font-body">
              <span className="font-bold text-white">{events.length}</span>{" "}
              {countLabel} trouvés
            </div>
          </div>
          <div className="hide-scrollbar mt-2 flex w-full gap-3 overflow-x-auto pb-2 font-display">
            <GenreFilter genres={genres} currentGenre={genre} type={type} />
          </div>
        </div>
      </section>

      <section className="w-full px-10 py-8 sm:px-14 lg:px-20 mb-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {events.map((movie) => (
            <Link
              key={movie.id ?? movie.title}
              href={`/evenements/${movie.id}`}
              className="group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,52,166,0.4)]"
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
                  <div className="mt-1 text-xs text-white/70 font-body">
                    {movie.meta}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg font-display">
                    Réserver
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
