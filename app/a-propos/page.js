import { StaticLink, StaticPage, StaticSection } from "../components/StaticPage";

export const metadata = {
  title: "À propos du Majestic | Majestic Bizerte",
  description:
    "Le Majestic est un lieu de cinéma et de culture à Bizerte : projections, spectacles et rendez-vous artistiques.",
};

export default function AProposPage() {
  return (
    <StaticPage title="À propos du Majestic">
      <StaticSection>
        <p>
          Le Majestic est un lieu de cinéma et de culture à Bizerte. Il
          accueille des projections, des spectacles et des rendez-vous
          artistiques qui réunissent le public, les artistes et les acteurs de
          la vie culturelle locale.
        </p>
        <p>
          Notre programmation vous invite à découvrir des films, à assister à
          des performances et à partager des moments de rencontre autour de la
          création. Retrouvez sur ce site les événements à l’affiche, les
          prochaines annonces, les horaires et les actualités du Majestic.
        </p>
        <p>
          Le Majestic accueille aussi les projets d’associations,
          d’organisations et de particuliers. Pour organiser un événement dans
          nos espaces, utilisez la rubrique « Réserver nos espaces » et
          présentez votre projet. Notre équipe vous accompagne pour préciser
          les besoins et les conditions d’accueil.
        </p>
        <p>
          Pour suivre notre actualité, retrouvez Le Majestic sur Facebook et
          Instagram. Pour une question sur une séance, une réservation ou un
          projet, consultez la page « Nous contacter ».
        </p>
      </StaticSection>

      <nav aria-label="Liens utiles" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <StaticLink href="/programme">→ Voir le programme</StaticLink>
        <StaticLink href="/evenements?type=show">→ Découvrir les spectacles</StaticLink>
        <StaticLink href="/reserver-espace">→ Réserver nos espaces</StaticLink>
        <StaticLink href="/contact">→ Nous contacter</StaticLink>
      </nav>
    </StaticPage>
  );
}
