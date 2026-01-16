"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { MdExpandMore } from "react-icons/md";

const buildHref = (type, genre) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (genre) params.set("genre", genre);
  const query = params.toString();
  return query ? `/evenements?${query}` : "/evenements";
};

const toLabel = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.name || value.label || value.value || "";
  }
  return String(value);
};

const uniqueSortedGenres = (genres, currentGenre) => {
  const set = new Set((genres || []).map(toLabel).filter(Boolean));
  if (currentGenre) set.add(currentGenre);
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" })
  );
};

export default function GenreFilter({ genres = [], currentGenre, type }) {
  const router = useRouter();
  const options = useMemo(
    () => uniqueSortedGenres(genres, currentGenre),
    [genres, currentGenre]
  );
  const value = currentGenre || "";

  return (
    <div className="relative">
      <select
        className="h-9 appearance-none rounded-lg border border-transparent bg-white/5 px-4 pr-8 text-sm font-semibold text-white/80 transition-colors hover:border-white/20 hover:bg-white/10 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30 font-display"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          router.push(buildHref(type, nextValue));
        }}
      >
        <option value="">Genre : Tous</option>
        {options.map((genre) => (
          <option key={genre} value={genre}>
            {`Genre : ${genre}`}
          </option>
        ))}
      </select>
      <MdExpandMore className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-white/60" />
    </div>
  );
}
