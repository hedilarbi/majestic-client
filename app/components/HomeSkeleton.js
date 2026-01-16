const posterSlots = Array.from({ length: 5 });
const showSlots = Array.from({ length: 4 });
const upcomingSlots = Array.from({ length: 2 });

export default function HomeSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-10 sm:px-12 lg:px-20">
          <div className="flex items-center gap-8">
            <div className="h-8 w-32 rounded-full bg-white/10 animate-pulse" />
            <div className="hidden gap-6 md:flex">
              <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden h-9 w-48 rounded-full bg-white/10 animate-pulse sm:block" />
            <div className="h-9 w-28 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative h-[85vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
          <div className="relative z-10 mx-auto flex h-full items-center px-10 sm:px-12 lg:px-20">
            <div className="space-y-4">
              <div className="h-12 w-72 rounded-full bg-white/10 animate-pulse sm:h-16 sm:w-96" />
              <div className="h-10 w-80 rounded-full bg-white/10 animate-pulse sm:h-14 sm:w-[28rem]" />
              <div className="h-4 w-72 rounded-full bg-white/10 animate-pulse" />
              <div className="flex gap-3 pt-4">
                <div className="h-12 w-44 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-12 w-40 rounded-lg bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-b border-white/5 py-12">
          <div className="mx-auto px-10 sm:px-12 lg:px-20">
            <div className="mb-10 space-y-3">
              <div className="h-6 w-48 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-64 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
              {posterSlots.map((_, index) => (
                <div
                  key={`poster-${index}`}
                  className="aspect-[2/3] rounded-lg bg-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-16">
          <div className="mx-auto px-10 sm:px-12 lg:px-20">
            <div className="mb-8 space-y-3">
              <div className="h-6 w-40 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-56 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="hide-scrollbar flex gap-6 overflow-x-auto pb-8">
              {showSlots.map((_, index) => (
                <div
                  key={`show-${index}`}
                  className="h-[420px] w-[280px] flex-none rounded-xl bg-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-4">
          <div className="mx-auto px-10 sm:px-12 lg:px-20">
            <div className="mb-8 h-6 w-44 rounded-full bg-white/10 animate-pulse" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {upcomingSlots.map((_, index) => (
                <div
                  key={`upcoming-${index}`}
                  className="aspect-video rounded-xl bg-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 bg-black/90 py-12">
        <div className="mx-auto px-10 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <div className="h-8 w-32 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-56 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-44 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-32 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-32 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="mt-10 h-px w-full bg-white/10" />
        </div>
      </footer>
    </div>
  );
}
