import ActualiteArticleCard from "./ActualiteArticleCard";
import ActualiteFormCard from "./ActualiteFormCard";
import ActualiteTrailerCard from "./ActualiteTrailerCard";

export default function ActualiteDetailContent({ item }) {
  if (!item) {
    return null;
  }

  if (item.type === "trailer") {
    return <ActualiteTrailerCard item={item} />;
  }

  if (item.type === "form") {
    return <ActualiteFormCard item={item} />;
  }

  return <ActualiteArticleCard item={item} />;
}
