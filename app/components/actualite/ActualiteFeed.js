import ActualiteListCard from "./ActualiteListCard";

export default function ActualiteFeed({ items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/55">
        Aucun contenu publié pour le moment.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ActualiteListCard key={item.id} item={item} />
      ))}
    </div>
  );
}
