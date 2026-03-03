import { redirect } from "next/navigation";

export default async function ReservationSiegesCheckoutAliasPage({ params }) {
  const { seanceId } = (await params) || {};

  if (!seanceId) {
    redirect("/evenements");
  }

  redirect(`/reserver-siege/${seanceId}/checkout`);
}
