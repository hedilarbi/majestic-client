import ReservationCheckoutClient from "./ReservationCheckoutClient";

export const metadata = {
  title: "Checkout reservation | Majestic",
  description: "Recapitulatif et affectation des tarifs pour vos places.",
};

const resolveSocketUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:5000";
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

export default async function ReserverSiegeCheckoutPage({ params }) {
  const { seanceId } = (await params) || {};
  const socketUrl = resolveSocketUrl();

  return (
    <ReservationCheckoutClient seanceId={seanceId} socketUrl={socketUrl} />
  );
}
