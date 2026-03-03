import { redirect } from "next/navigation";

export default async function ReserverSiegeAliasPage({ params }) {
  const { seanceId } = (await params) || {};

  if (!seanceId) {
    redirect("/");
  }

  redirect(`/reservation-sieges/${seanceId}`);
}
