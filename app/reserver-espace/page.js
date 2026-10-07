import FaqSection from "../components/FaqSection";
import { reserverEspaceFaq } from "../lib/seo-faqs";
import ReservationSpacePageClient from "./ReservationSpacePageClient";

export const metadata = {
  title: "Réserver un espace culturel au Majestic Bizerte | Salle et événements",
  description:
    "Réservez un espace au Majestic Bizerte pour organiser atelier, formation, projection ou événement culturel. Demande de réservation en ligne pour les salles du Majestic.",
};

export default function ReservationSpacePage() {
  return (
    <>
      <ReservationSpacePageClient />
      <FaqSection
        title="FAQ – Réserver un espace au Majestic Bizerte"
        items={reserverEspaceFaq}
      />
    </>
  );
}
