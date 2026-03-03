import { getPublicSubscriptionById } from "@/app/lib/offers-api";
import SubscriptionCheckoutClient from "./SubscriptionCheckoutClient";

export const metadata = {
  title: "Checkout abonnement | Majestic",
  description:
    "Finalisez votre abonnement Majestic en quelques etapes.",
};

export default async function SubscriptionCheckoutPage({ params }) {
  const resolvedParams = (await params) || {};
  const subscriptionId = resolvedParams.subscriptionId || "";
  const { subscription, error } = await getPublicSubscriptionById(subscriptionId);

  return (
    <SubscriptionCheckoutClient
      subscriptionId={subscriptionId}
      subscription={subscription}
      initialError={error}
    />
  );
}

