import { ACTUALITE_TYPE_META } from "@/app/lib/actualites-utils";

export default function ActualiteTypeBadge({ type }) {
  const meta = ACTUALITE_TYPE_META[type] || ACTUALITE_TYPE_META.article;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${meta.accentClass}`}
    >
      {meta.label}
    </span>
  );
}
