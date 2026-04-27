import { RiArrowLeftSLine } from "react-icons/ri";

export default function ReservationPageLoading() {
  return (
    <main className="mt-3 flex flex-col gap-3 px-2 pt-2 pb-24 lg:mt-4 lg:flex-row lg:items-start lg:px-16 lg:pt-0 lg:pb-3">
      <section className="flex-1 lg:pr-4">
        <div className="flex flex-col items-center gap-4 lg:items-stretch">
          <div className="w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80">
              <RiArrowLeftSLine className="h-6 w-6" />
            </div>
          </div>

          <div className="h-14 w-full animate-pulse rounded-2xl border border-white/10 bg-white/5" />

          <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/10 sm:h-[360px] lg:h-[460px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-accent/35 border-t-accent" />
            </div>
            <div className="absolute left-4 right-4 top-4 grid grid-cols-10 gap-2 opacity-45">
              {Array.from({ length: 120 }).map((_, index) => (
                <span
                  key={`seat-skeleton-${index}`}
                  className="h-6 rounded bg-white/10"
                />
              ))}
            </div>
          </div>

          <div className="h-16 w-full animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </section>

      <aside className="hidden w-full shrink-0 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:block lg:w-[360px] lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-44 rounded bg-white/10" />
          <div className="h-48 rounded-2xl bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
          <div className="h-28 rounded-2xl bg-white/10" />
          <div className="h-12 rounded-2xl bg-accent/30" />
        </div>
      </aside>
    </main>
  );
}
