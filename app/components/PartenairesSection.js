import Image from "next/image";

const resolveImageAspect = (value) =>
  value === "vertical" ? "vertical" : "horizontal";

const getImageAspectRatio = (value) =>
  resolveImageAspect(value) === "vertical" ? "1 / 2" : "2 / 1";

const getPartnerCardClass = (value) =>
  resolveImageAspect(value) === "vertical"
    ? "mx-auto max-w-28 p-4"
    : "w-full p-6";

export default function PartenairesSection({ items = [] }) {
  const partnersWithLogo = items
    .map((partenaire) => ({
      id: partenaire._id || partenaire.id || partenaire.name || partenaire.nom,
      name: partenaire.name || partenaire.nom || "Partenaire",
      logo: partenaire.image || partenaire.logo || "",
      imageAspect: resolveImageAspect(partenaire.imageAspect),
    }))
    .filter((partenaire) => partenaire.logo);

  if (!partnersWithLogo.length) return null;

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

        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {partnersWithLogo.map((partenaire) => {
            return (
              <div key={partenaire.id} className="flex justify-center">
                <div
                  className={`group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-primary/30 hover:bg-white/[0.07] ${getPartnerCardClass(partenaire.imageAspect)}`}
                  style={{ aspectRatio: getImageAspectRatio(partenaire.imageAspect) }}
                >
                  <Image
                    src={partenaire.logo}
                    alt={partenaire.name}
                    fill
                    sizes="(min-width: 1024px) 14vw, (min-width: 640px) 30vw, 45vw"
                    className="object-contain p-4 brightness-75 grayscale transition duration-300 group-hover:brightness-100 group-hover:grayscale-0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
