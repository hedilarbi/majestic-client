import HeroSection from "./components/HeroSection";
import NowShowingSection from "./components/NowShowingSection";
import SpectacleSection from "./components/SpectacleSection";

import UpcomingSection from "./components/UpcomingSection";
import { getHomeData } from "./lib/home-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { heroSlides, nowShowing, spectacles, upcoming } = await getHomeData({
    noCache: true,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection slides={heroSlides} />
        <NowShowingSection items={nowShowing} />
        <SpectacleSection items={spectacles} />
        <UpcomingSection items={upcoming} />
      </main>
    </div>
  );
}
