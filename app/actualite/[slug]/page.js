import Link from "next/link";
import { notFound } from "next/navigation";

import ActualiteDetailContent from "@/app/components/actualite/ActualiteDetailContent";
import { getPublishedActualiteBySlug } from "@/app/lib/actualites-api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getPublishedActualiteBySlug(slug, { noCache: true });

  if (!item) {
    return {
      title: "Actualités | Majestic",
      description: "Découvrez toute l'actualités du Majestic.",
    };
  }

  const seoTitle = item.seoTitle?.trim() || `${item.title} | Actualités | Majestic`;
  const seoDescription =
    item.seoDescription?.trim() ||
    item.excerpt?.trim() ||
    item.formDescription?.trim() ||
    "Actualités Majestic";

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: item.seoTitle?.trim() || item.title,
      description: seoDescription,
      type: item.type === "article" ? "article" : "website",
      images: item.image ? [{ url: item.image, alt: item.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: item.seoTitle?.trim() || item.title,
      description: seoDescription,
      images: item.image ? [item.image] : [],
    },
  };
}

export default async function ActualiteDetailPage({ params }) {
  const { slug } = await params;
  const item = await getPublishedActualiteBySlug(slug, { noCache: true });

  if (!item) {
    notFound();
  }

  return (
    <main className="px-6 pb-16 pt-10 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/actualite"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-accent"
        >
          ← Retour à l&apos;actualité
        </Link>

        <section className="mt-6">
          <ActualiteDetailContent
            item={item}
          />
        </section>
      </div>
    </main>
  );
}
