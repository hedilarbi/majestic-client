"use client";

import ActualiteFeed from "@/app/components/actualite/ActualiteFeed";

export default function ActualitePageClient({ items = [] }) {
  return (
    <main className="px-6 pb-16 pt-10 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <section className="py-8 sm:py-10">
          <h1 className="text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl font-display">
            Actualité
          </h1>
        </section>

        <section className="mt-8">
          <ActualiteFeed items={items} />
        </section>
      </div>
    </main>
  );
}
