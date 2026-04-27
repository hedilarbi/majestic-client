import Link from "next/link";
import { notFound } from "next/navigation";

import ActualiteDetailContent from "@/app/components/actualite/ActualiteDetailContent";
import { getCurrentCustomerUser } from "@/app/lib/auth-server";
import { getPublishedActualiteBySlug } from "@/app/lib/actualites-api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getPublishedActualiteBySlug(slug, { noCache: true });

  if (!item) {
    return {
      title: "Actualité | Majestic",
    };
  }

  return {
    title: `${item.title} | Actualité | Majestic`,
    description: item.excerpt || item.formDescription || "Actualité Majestic",
  };
}

export default async function ActualiteDetailPage({ params }) {
  const { slug } = await params;
  const item = await getPublishedActualiteBySlug(slug, { noCache: true });

  if (!item) {
    notFound();
  }

  const currentUser =
    item.type === "form" ? await getCurrentCustomerUser() : null;

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
            currentUser={currentUser}
            redirectPath={`/actualite/${item.slug || item.id}`}
          />
        </section>
      </div>
    </main>
  );
}
