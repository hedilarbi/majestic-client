import ReservationSiegesClient from "./ReservationSiegesClient";

export const metadata = {
  title: "Selection de sièges | Majestic",
  description: "Selectionnez vos sièges et consultez les tarifs disponibles.",
};

const resolveSocketUrl = () => {
  return process.env.NEXT_PUBLIC_SOCKET_URL || "";
};

export default async function ReservationSiegesPage({ params }) {
  const { seanceId } = (await params) || {};
  const socketUrl = resolveSocketUrl();

  return (
    <ReservationSiegesClient seanceId={seanceId} socketUrl={socketUrl} />
  );
}
