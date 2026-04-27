import { RiArmchairFill, RiArmchairLine } from "react-icons/ri";

export default function SeatLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
        <RiArmchairLine className="h-6 w-6 text-white/25" />
        Libre
      </div>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
        <RiArmchairFill className="h-6 w-6 text-accent" />
        Selectionne
      </div>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-red-400">
        <RiArmchairFill className="h-6 w-6 text-red-400" />
        Occupe
      </div>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
        <RiArmchairLine className="h-6 w-6 text-accent" />
        Tarif fixe
      </div>
    </div>
  );
}
