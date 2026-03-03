import OffresClient from "./OffresClient";
import { getPublicOffers } from "@/app/lib/offers-api";

export const metadata = {
  title: "Offres | Majestic",
  description:
    "Accedez aux offres premium et codes promo exclusifs de Majestic.",
};

export default async function OffresPage() {
  const { subscriptions, promoCodes, error } = await getPublicOffers();

  return (
    <OffresClient
      subscriptions={subscriptions}
      promoCodes={promoCodes}
      error={error}
    />
  );
}
