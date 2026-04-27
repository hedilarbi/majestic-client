import { RiArrowRightSLine, RiCloseLine } from "react-icons/ri";

export default function MobileInfoDrawer({
  isOpen,
  onClose,
  onChangeSeance,
  canChangeSeance,
  children,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/70 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Fermer les informations de séance"
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-[88%] max-w-[380px] transform overflow-y-auto border-l border-white/10 bg-[#060911] p-5 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-accent">
            Details séance
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/70"
            aria-label="Fermer"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onChangeSeance}
          disabled={!canChangeSeance}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold uppercase tracking-[0.22em] transition ${
            canChangeSeance
              ? "border-accent/60 text-accent"
              : "cursor-not-allowed border-white/10 text-white/30"
          }`}
        >
          Changer la séance
          <RiArrowRightSLine className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
