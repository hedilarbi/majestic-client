import Image from "next/image";

const PARTENAIRES = [
  { id: 1, nom: "Partenaire 1", logo: "/images/partenaires/partenaire-1.png" },
  { id: 2, nom: "Partenaire 2", logo: "/images/partenaires/partenaire-2.png" },
  { id: 3, nom: "Partenaire 3", logo: "/images/partenaires/partenaire-3.png" },
  { id: 4, nom: "Partenaire 4", logo: "/images/partenaires/partenaire-4.png" },
  { id: 5, nom: "Partenaire 5", logo: "/images/partenaires/partenaire-5.png" },
  { id: 6, nom: "Partenaire 6", logo: "/images/partenaires/partenaire-6.png" },
];

export default function PartenairesSection({ items = PARTENAIRES }) {
  if (!items.length) return null;

  return (
    <section className="relative w-full border-t border-white/5 py-14">
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <div className="mb-10">
          <h2 className="flex items-center gap-3 text-2xl font-semibold uppercase tracking-wide text-white md:text-3xl font-display">
            <span className="block h-8 w-1 rounded-full bg-accent" />
            Nos Partenaires
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base font-body">
            Ils nous font confiance et contribuent à faire vivre la culture au
            Majestic.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((partenaire) => (
            <div
              key={partenaire.id}
              className="group flex flex-col items-center justify-center gap-3 rounded-[1.8rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-primary/30 hover:bg-white/[0.07]"
            >
              <div className="relative h-14 w-full">
                <Image
                  src={partenaire.logo}
                  alt={partenaire.nom}
                  fill
                  sizes="(min-width: 1024px) 14vw, (min-width: 640px) 30vw, 45vw"
                  className="object-contain brightness-75 grayscale transition duration-300 group-hover:brightness-100 group-hover:grayscale-0"
                />
              </div>
              <span className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/40 transition group-hover:text-white/70">
                {partenaire.nom}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
