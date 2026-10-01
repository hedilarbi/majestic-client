"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdClose } from "react-icons/md";

const EXIT_DURATION = 300;

export default function SessionDetailModal({
  selection,
  dateLabel = "Date indisponible",
  onClose,
}) {
  const router = useRouter();
  const [displayedSelection, setDisplayedSelection] = useState(selection);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selection) {
      let visibleFrame;
      const displayFrame = requestAnimationFrame(() => {
        setDisplayedSelection(selection);
        visibleFrame = requestAnimationFrame(() => setIsVisible(true));
      });
      return () => {
        cancelAnimationFrame(displayFrame);
        if (visibleFrame) cancelAnimationFrame(visibleFrame);
      };
    }

    const frame = requestAnimationFrame(() => setIsVisible(false));
    const timeout = setTimeout(
      () => setDisplayedSelection(null),
      EXIT_DURATION,
    );
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [selection]);

  useEffect(() => {
    if (!displayedSelection) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [displayedSelection, onClose]);

  if (!displayedSelection) return null;

  const { event, session } = displayedSelection;
  const title = event?.title || event?.name || "Événement";
  const poster = event?.poster;
  const duration = event?.durationLabel || "";
  const time = session?.time || session?.sessionTime || "--:--";
  const version = session?.label || session?.version || "Version";
  const sessionId = session?.id || session?._id;

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        aria-label="Fermer le détail de la séance"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-[1px] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 h-dvh w-full overflow-y-auto border-l border-white/10 bg-[#0a0f17] shadow-2xl transition-transform duration-300 ease-out sm:w-[min(72vw,560px)] lg:w-[min(40vw,620px)] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative flex h-full flex-col">
          {poster ? (
            <div className="absolute inset-0">
              <Image
                src={poster}
                alt={`Affiche ${title}`}
                fill
                sizes="(max-width: 767px) 100vw, 40vw"
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f17]/40 via-[#0a0f17]/90 to-[#0a0f17]" />
            </div>
          ) : null}

          <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
                  Détails séance
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-white font-display">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/80 transition hover:text-white"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-2xl font-semibold text-white/90 md:text-3xl">
                {dateLabel}
              </p>
              <p className="mt-2 text-5xl font-black tracking-tight text-white md:text-6xl">
                {time}
              </p>
              <p className="mt-3 text-sm font-normal uppercase tracking-[0.24em] text-white/75 md:text-base">
                {version}
              </p>
              {duration ? (
                <p className="mt-10 text-sm font-medium text-white/85 md:text-base">
                  Durée : {duration}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!sessionId}
                onClick={() => sessionId && router.push(`/reservations/${sessionId}`)}
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Réserver maintenant
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
