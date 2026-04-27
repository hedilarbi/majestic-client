import HeroSection from "./components/HeroSection";
import NowShowingSection from "./components/NowShowingSection";
import SpectacleSection from "./components/SpectacleSection";
import ActualiteHomeSection from "./components/actualite/ActualiteHomeSection";

import UpcomingSection from "./components/UpcomingSection";
import { getPublishedActualites } from "./lib/actualites-api";
import { getHomeData } from "./lib/home-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ heroSlides, nowShowing, spectacles, upcoming }, actualites] =
    await Promise.all([
      getHomeData({
        noCache: true,
      }),
      getPublishedActualites({ noCache: true, limit: 3 }),
    ]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection slides={heroSlides} />
        <NowShowingSection items={nowShowing} />
        <SpectacleSection items={spectacles} />
        <UpcomingSection items={upcoming} />
        <ActualiteHomeSection items={actualites} />
      </main>
    </div>
  );
}
