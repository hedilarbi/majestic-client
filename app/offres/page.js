import OffresClient from "./OffresClient";
import { getPublicOffers } from "@/app/lib/offers-api";
import { cookies } from "next/headers";

export const metadata = {
  title: "Offres | Majestic",
  description:
    "Accedez aux offres premium et codes promo exclusifs de Majestic.",
};

export default async function OffresPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const { subscriptions, promoCodes, error } = await getPublicOffers({ token });

  return (
    <OffresClient
      subscriptions={subscriptions}
      promoCodes={promoCodes}
      error={error}
    />
  );
}
