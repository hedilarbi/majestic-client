import PurchaseSuccessClient from "./PurchaseSuccessClient";

export const metadata = {
  title: "Achat confirmé | Majestic",
  description:
    "Votre réservation est confirmée. Retrouvez ici le récapitulatif de votre achat.",
};

export default async function CheckoutSuccessPage({ params, searchParams }) {
  const resolvedParams = (await params) || {};
  const resolvedSearchParams = (await searchParams) || {};
  const rawBookingId = resolvedSearchParams.bookingId;

  return (
    <PurchaseSuccessClient
      seanceId={resolvedParams.seanceId || ""}
      bookingId={typeof rawBookingId === "string" ? rawBookingId : ""}
    />
  );
}

