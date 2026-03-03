import Image from "next/image";
import {
  RiArmchairLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiPriceTag3Line,
  RiTimeLine,
} from "react-icons/ri";

export default function CheckoutSidebar({
  seanceInfo,
  seatLabels,
  safeSeatsCount,
  submitStatus,
  canContinue,
  remainingToAssign,
  fallbackPoster,
}) {
  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-24 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#161e22] p-5">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
          <Image
            src={seanceInfo.poster || fallbackPoster}
            alt={`Affiche ${seanceInfo.title}`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 28vw, 100vw"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
              {seanceInfo.title}
            </h2>
            {seanceInfo.genre || seanceInfo.duration ? (
              <p className="mt-1 text-sm font-semibold text-accent">
                {[seanceInfo.genre, seanceInfo.duration].filter(Boolean).join(" • ")}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 text-sm text-white/75">
            <div className="flex items-center gap-2">
              <RiCalendarLine className="h-4 w-4 text-accent" />
              <span>{seanceInfo.date || "Date a venir"}</span>
            </div>
            <div className="flex items-center gap-2">
              <RiTimeLine className="h-4 w-4 text-accent" />
              <span className="font-semibold text-white">
                {seanceInfo.time || "Horaire"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <RiArmchairLine className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {seanceInfo.room || "Salle"}
                {seatLabels.length ? `, sieges ${seatLabels.join(", ")}` : ""}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <RiPriceTag3Line className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {safeSeatsCount} place{safeSeatsCount > 1 ? "s" : ""} sélectionnée
                {safeSeatsCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          {submitStatus === "success" ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <RiCheckboxCircleLine className="h-5 w-5" />
              Vente finalisee.
            </div>
          ) : canContinue ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <RiCheckboxCircleLine className="h-5 w-5" />
              Toutes les places sont attribuees.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <RiCloseCircleLine className="h-5 w-5" />
              Attribution incomplete ({remainingToAssign} restantes).
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
