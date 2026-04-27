import ReservationCheckoutClient from "./ReservationCheckoutClient";

export const metadata = {
  title: "Checkout réservation | Majestic",
  description: "Récapitulatif et affectation des tarifs pour vos places.",
};

const resolveSocketUrl = () => {
  return process.env.NEXT_PUBLIC_SOCKET_URL || "";
};

export default async function ReserverSiegeCheckoutPage({ params }) {
  const { seanceId } = (await params) || {};
  const socketUrl = resolveSocketUrl();

  return (
    <ReservationCheckoutClient seanceId={seanceId} socketUrl={socketUrl} />
  );
}
