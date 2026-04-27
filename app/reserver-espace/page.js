import ReservationSpacePageClient from "./ReservationSpacePageClient";

export const metadata = {
  title: "Reserver l'espace | Majestic",
  description:
    "Envoyez une demande de réservation d'espace au Majestic pour votre association ou organisation.",
};

export default function ReservationSpacePage() {
  return <ReservationSpacePageClient />;
}
