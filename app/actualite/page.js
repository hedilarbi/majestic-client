import ActualitePageClient from "./ActualitePageClient";

import { getPublishedActualites } from "@/app/lib/actualites-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Actualités| Majestic",
  description:
    "Retrouvez les derniers articles, bandes-annonces et formulaires publiés par Le Majestic.",
};

export default async function ActualitePage() {
  const items = await getPublishedActualites({ noCache: true });

  return <ActualitePageClient items={items} />;
}
