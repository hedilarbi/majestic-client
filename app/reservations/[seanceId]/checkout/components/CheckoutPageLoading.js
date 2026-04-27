import { RiArrowLeftSLine } from "react-icons/ri";

export default function CheckoutPageLoading() {
  return (
    <main className="mx-auto max-w-7xl px-3 py-6 md:px-8">
      <div className="mb-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60">
          <RiArrowLeftSLine className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <section className="lg:col-span-8 flex flex-col gap-5">
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-72 rounded bg-white/10" />
            <div className="h-4 w-full max-w-xl rounded bg-white/10" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161e22]/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent/35 border-t-accent" />
              <p className="text-sm font-semibold text-white/70">
                Chargement du récapitulatif...
              </p>
            </div>
          </div>

          <div className="h-28 animate-pulse rounded-2xl border border-white/10 bg-[#161e22]/90" />
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-[#161e22]/70" />
          <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-[#161e22]/70" />
          <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-[#161e22]/70" />
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-[#161e22]/70" />
        </section>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#161e22] p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-56 rounded-xl bg-white/10" />
              <div className="h-5 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-12 rounded-xl bg-accent/30" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
