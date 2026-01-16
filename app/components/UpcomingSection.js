import Image from "next/image";
import Link from "next/link";
import { MdPlayArrow } from "react-icons/md";

export default function UpcomingSection({ items = [] }) {
  if (!items.length) return null;

  return (
    <section id="prochainement" className="w-full bg-transparent py-4">
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <h2 className="mb-8 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white font-display">
          <span className="block h-8 w-1 rounded-full bg-accent" />
          Prochainement
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((movie) => (
            <Link
              key={movie.id ?? movie.title}
              href={`/evenements/${movie.id}`}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl"
              aria-label={`Voir ${movie.title}`}
            >
              <Image
                src={movie.image}
                alt={movie.imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <MdPlayArrow className="ml-1 h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent font-display">
                  {movie.date}
                </span>
                <h3 className="mt-1 text-2xl font-semibold text-white font-display">
                  {movie.title}
                </h3>
                <p className="line-clamp-1 text-white/60 font-body">
                  {movie.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
