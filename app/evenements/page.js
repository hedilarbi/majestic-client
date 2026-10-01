import Image from "next/image";
import Link from "next/link";
import GenreFilter from "../components/GenreFilter";
import TrailerModalButton from "../components/TrailerModalButton";
import UpcomingEventsGrid from "../components/UpcomingEventsGrid";
import { getEventsWithALaffiche } from "../lib/events-api";

export const dynamic = "force-dynamic";

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
  const [{ events, aLaffiche, showTypes, prochainement, expiredShows }, allEventsResponse] =
    await Promise.all([
      getEventsWithALaffiche({ type, genre, noCache: true }),
      genre
        ? getEventsWithALaffiche({ type, noCache: true })
        : Promise.resolve(null),
    ]);

  const allShowTypes = allEventsResponse?.showTypes ?? showTypes ?? [];
  const upcomingEvents =
    allEventsResponse?.prochainement ?? prochainement ?? [];
  const allExpiredShows = allEventsResponse?.expiredShows ?? expiredShows ?? [];
  const heroEntry = aLaffiche?.[0];
  const heroEvent = heroEntry ? heroEntry.event : events?.[0];
  const heroImageDesktop = heroEntry?.poster || heroEvent?.image;
  const heroImageMobile =
    heroEntry?.eventPoster || heroEvent?.image || heroEntry?.poster;
  const heroTitle =
    heroEntry?.title || heroEvent?.title || "À l'affiche";
  const heroSubtitle =
    heroEntry?.subtitle ||
    heroEvent?.description ||
    "Découvrez les plus grands films et expériences cinéma du moment.";
  const heroMeta = heroEvent?.meta || "Expérience cinéma premium";
  const heroEventId = heroEntry?.eventId || heroEvent?.id;
  const heroTrailerLink = heroEvent?.trailerLink || "";
  const ctaLabel =
    type === "show" ? "VOIR PLUS DE SPECTACLES" : "VOIR PLUS DE FILMS";
  const genres = type === "show" ? allShowTypes : MOVIE_GENRES;

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white">
      <section className="w-full pb-6">
        <div className="group relative h-[40vh] w-full overflow-hidden border border-white/10 shadow-2xl md:h-[60vh] lg:h-[80vh]">
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
          <div className="relative z-20 flex h-full flex-col items-start justify-center gap-3 px-5 sm:px-10 lg:px-20">
            {/* <span className="rounded border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent font-display">
              TENDANCE
            </span> */}
            <h1 className="text-xl font-bold leading-tight tracking-[-0.03em] text-white drop-shadow-lg sm:text-3xl lg:text-5xl font-display">
              {heroTitle}
            </h1>
            <div className="text-xs text-white/70 sm:text-sm lg:text-base font-body">
              {heroMeta}
            </div>
            <p className="line-clamp-3 max-w-lg text-xs leading-relaxed text-white/70 sm:text-base lg:text-lg font-body">
              {heroSubtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {heroEventId ? (
                <Link
                  className="flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-[11px] font-semibold text-black shadow-[0_0_20px_rgba(116,208,241,0.4)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_30px_rgba(116,208,241,0.6)] sm:h-10 sm:px-4 sm:text-xs lg:h-11 lg:px-5 lg:text-sm font-display"
                  href={`/evenements/${heroEventId}`}
                >
                  Réserver
                </Link>
              ) : null}
              <TrailerModalButton
                trailerLink={heroTrailerLink}
                title={heroTitle}
                label="Bande-annonce"
                className="flex h-9 items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 text-[11px] font-semibold text-accent shadow-[0_0_12px_rgba(116,208,241,0.2)] transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-black sm:h-10 sm:px-4 sm:text-xs lg:h-11 lg:px-5 lg:text-sm font-display"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-2 sm:px-8 lg:px-20">
        <div className="rounded-xl border border-white/10 bg-black/70 p-4 shadow-lg backdrop-blur-lg">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-white sm:text-xl font-display">
              À l&apos;affiche
            </h2>
            <GenreFilter genres={genres} currentGenre={genre} type={type} />
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 sm:px-8 lg:px-20">
        {type === "show" && events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/60 backdrop-blur-sm">
            Pas de spectacles à l&apos;affiche en ce moment.
          </div>
        ) : null}
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
                  <span className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-black shadow-[0_0_20px_rgba(116,208,241,0.45)] font-display">
                    Réserver
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {type === "show" && events.length === 0 && allExpiredShows.length ? (
        <section className="w-full px-4 py-8 sm:px-8 lg:px-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-white/30" />
            <h2 className="text-xl font-semibold text-white/60 sm:text-3xl font-display">
              Spectacles passés
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {allExpiredShows.map((show) => (
              <Link
                key={show.id ?? show.title}
                href={`/evenements/${show.id}`}
                className="group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-white/5 opacity-60 transition-all duration-300 hover:opacity-80"
              >
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={show.image}
                    alt={show.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                    className="object-cover grayscale transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-80" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    Terminé
                  </span>
                  <div className="absolute bottom-0 left-0 w-full translate-y-2 p-4 transition-transform duration-300 group-hover:translate-y-0">
                    <h3 className="text-lg font-semibold leading-tight text-white/80 drop-shadow-md font-display">
                      {show.title}
                    </h3>
                    <div className="mt-1 text-xs text-white/55 font-body">
                      {show.meta}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {upcomingEvents.length ? (
        <section className="mb-20 w-full px-4 py-8 sm:px-8 lg:px-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-accent" />
            <h2 className="text-xl font-semibold text-white sm:text-3xl font-display">
              Prochainement
            </h2>
          </div>
          <UpcomingEventsGrid
            items={upcomingEvents}
            paginated={type === "movie"}
          />
        </section>
      ) : null}
    </main>
  );
}
