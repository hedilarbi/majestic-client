import PurchaseSuccessClient from "./PurchaseSuccessClient";

export const metadata = {
  title: "Achat confirme | Majestic",
  description:
    "Votre reservation est confirmee. Retrouvez ici le recapitulatif de votre achat.",
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

