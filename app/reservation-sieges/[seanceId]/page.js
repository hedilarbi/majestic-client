import ReservationSiegesClient from "./ReservationSiegesClient";

export const metadata = {
  title: "Selection de sieges | Majestic",
  description: "Selectionnez vos sieges et consultez les tarifs disponibles.",
};

const resolveSocketUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:5000";
  return raw.startsWith("http") ? raw : `http://${raw}`;
};

export default async function ReservationSiegesPage({ params }) {
  const { seanceId } = (await params) || {};
  const socketUrl = resolveSocketUrl();

  return (
    <ReservationSiegesClient seanceId={seanceId} socketUrl={socketUrl} />
  );
}
