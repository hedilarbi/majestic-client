import HeroSection from "./components/HeroSection";
import NowShowingSection from "./components/NowShowingSection";
import SpectacleSection from "./components/SpectacleSection";
import ActualiteHomeSection from "./components/actualite/ActualiteHomeSection";
import PartenairesSection from "./components/PartenairesSection";
import FaqSection from "./components/FaqSection";

import UpcomingSection from "./components/UpcomingSection";
import { getPublishedActualites } from "./lib/actualites-api";
import { getHomeData } from "./lib/home-api";
import { getPublicPartners } from "./lib/partners-api";
import { homeFaq } from "./lib/seo-faqs";

export const dynamic = "force-dynamic";

const HOME_TITLE =
  "Cinéma Majestic Bizerte – E-billet Films à l’affiche, spectacles et espace culturel";
const HOME_DESCRIPTION =
  "Découvrez le cinéma Majestic Bizerte : films à l’affiche, horaires des séances, spectacles et événements culturels. Réservez votre place ou votre espace.";

export const metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  // openGraph/twitter replace the layout ones, so repeat type/locale/images.
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    images: [{ url: "/images/logo.png", width: 512, height: 512, alt: "Majestic Bizerte" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export default async function Home() {
  const [{ heroSlides, nowShowing, spectacles, upcoming, lastExpiredShow }, actualites, partners] =
    await Promise.all([
      getHomeData({
        noCache: true,
        limitNowShowing: false,
        limitUpcoming: false,
      }),
      getPublishedActualites({ noCache: true, limit: 3 }),
      getPublicPartners({ noCache: true }),
    ]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection slides={heroSlides} />
        <NowShowingSection items={nowShowing} />
        <SpectacleSection items={spectacles} lastExpiredItem={lastExpiredShow} />
        <UpcomingSection items={upcoming} />
        <ActualiteHomeSection items={actualites} />
        <PartenairesSection items={partners} />
        <FaqSection title="FAQ – Cinéma Majestic Bizerte" items={homeFaq} />
      </main>
    </div>
  );
}
