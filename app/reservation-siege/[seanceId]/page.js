import { redirect } from "next/navigation";

export default async function ReservationSiegeAliasPage({ params }) {
  const { seanceId } = (await params) || {};

  if (!seanceId) {
    redirect("/programme");
  }

  redirect(`/reservation-sieges/${seanceId}`);
}
