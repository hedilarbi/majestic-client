import Image from "next/image";
import Link from "next/link";

export default function UpcomingSection({ items = [] }) {
  if (!items.length) return null;

  return (
    <section id="prochainement" className="w-full bg-transparent py-4">
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <h2 className="mb-8 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white font-display">
          <span className="block h-8 w-1 rounded-full bg-accent" />
          Prochainement
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
          {items.map((movie) => (
            <Link
              key={movie.id ?? movie.title}
              href={`/evenements/${movie.id}`}
              className="group relative block"
              aria-label={`Voir ${movie.title}`}
            >
              <article className="cursor-pointer">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg shadow-black/50">
                  <Image
                    src={movie.image}
                    alt={movie.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 22vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-semibold leading-tight text-white transition-colors group-hover:text-accent font-display">
                    {movie.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-white/60 font-body">
                    {movie.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
