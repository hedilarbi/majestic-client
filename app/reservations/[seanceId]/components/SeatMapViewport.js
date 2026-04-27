import { RiDragMove2Line, RiZoomInLine } from "react-icons/ri";

import { getSeatStatus, isAisleCell, seatKey } from "@/app/lib/seat-utils";

import SeatIcon from "./SeatIcon";

export default function SeatMapViewport({
  viewportRef,
  canvasRef,
  isDesktop,
  desktopViewportHeight,
  seatRows,
  maxCols,
  seatGridWidth,
  seatCellSize,
  gridGap,
  selectedSeatKeys,
  reservationSeatKeys,
  isLoading,
  loadError,
  onToggleSeat,
  onTouchSeatEnd,
  getFixedSeatMeta,
  isFixedPricingSoldOut,
}) {
  return (
    <div className="w-full">
      <div
        ref={viewportRef}
        className="relative h-[320px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/10 sm:h-[360px] lg:h-auto"
        style={{
          touchAction: isDesktop ? "auto" : "none",
          overscrollBehavior: isDesktop ? "auto" : "contain",
          height: isDesktop ? `${desktopViewportHeight}px` : undefined,
        }}
      >
        <div
          ref={canvasRef}
          className="absolute left-0 top-0 space-y-1 px-4 py-2 lg:px-8 lg:py-5"
          style={{
            transform: "translate3d(0px, 0px, 0) scale(1)",
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <div className="mb-4 pl-5">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_-8px_24px_rgba(116,208,241,0.4)]"
              style={{ width: `${seatGridWidth}px` }}
            />
            <p
              className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.55em] text-white/40"
              style={{ width: `${seatGridWidth}px` }}
            >
              Ecran
            </p>
          </div>

          {seatRows.map((row) => (
            <div key={row.label} className="flex items-center gap-1">
              <div className="flex w-4 items-center justify-center text-[10px] font-semibold text-white/40">
                {row.label}
              </div>
              <div
                className="grid"
                style={{
                  columnGap: `${gridGap}px`,
                  rowGap: `${gridGap}px`,
                  gridTemplateColumns: `repeat(${maxCols || 1}, ${seatCellSize}px)`,
                }}
              >
                {row.cells.map((cell, index) => {
                  if (!cell || isAisleCell(cell)) {
                    return (
                      <div
                        key={`${row.label}-empty-${index}`}
                        className="h-[34px] w-[34px]"
                        aria-hidden="true"
                      />
                    );
                  }

                  const key = seatKey(cell.row, cell.col);
                  const isSelected = selectedSeatKeys.has(key);
                  const status = getSeatStatus(cell.status);
                  const isMine = reservationSeatKeys.has(key);
                  const displayStatus = isSelected || isMine ? "selected" : status;
                  const fixedSeatMeta = getFixedSeatMeta?.(cell) || null;
                  const isFixedPricing = Boolean(fixedSeatMeta);
                  const isSoldOutFixedPricing = Boolean(
                    isFixedPricingSoldOut?.(cell),
                  );
                  const isBookable = cell.isBookable !== false;
                  const canSelect =
                    (status === "available" && isBookable && !isSoldOutFixedPricing) ||
                    isSelected ||
                    isMine;
                  const isDisabled = !canSelect;

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`flex h-[34px] w-[34px] items-center justify-center rounded-md p-0 ${
                        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      aria-label={`Siège ${row.label}${cell.col}`}
                      disabled={isDisabled}
                      onClick={() => onToggleSeat(cell)}
                      onTouchEnd={(event) => onTouchSeatEnd?.(event, cell)}
                    >
                      <SeatIcon status={displayStatus} isFixedPricing={isFixedPricing} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50 lg:hidden">
        <span className="flex items-center gap-2">
          <RiZoomInLine className="h-4 w-4 text-white/60" />
          Pincez pour zoomer
        </span>
        <span className="flex items-center gap-2">
          <RiDragMove2Line className="h-4 w-4 text-white/60" />
          Glissez pour deplacer
        </span>
      </div>

      {!seatRows.length && !isLoading ? (
        <p className="mt-4 text-center text-xs text-white/60">
          Aucun plan de salle disponible.
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-3 text-center text-xs text-red-400">{loadError}</p>
      ) : null}
    </div>
  );
}
