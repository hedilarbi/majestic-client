import { RiArrowRightSLine, RiInformationLine } from "react-icons/ri";

export default function MobileSessionInfoButton({
  seanceInfo,
  sessionDateTime,
  onOpen,
}) {
  return (
    <div className="w-full lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{seanceInfo.title}</p>
          <p className="mt-1 truncate text-xs text-white/60">
            {sessionDateTime || "Details indisponibles"}
          </p>
        </div>
        <span className="ml-3 flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <RiInformationLine className="h-4 w-4" />
          Infos
          <RiArrowRightSLine className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}
