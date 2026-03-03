"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { RiArrowLeftSLine } from "react-icons/ri";

import {
  buildSeatRows,
  normalizeSeatsPayload,
  seatKey,
} from "@/app/lib/seat-utils";
import { normalizeReservationResponse } from "@/app/lib/reservation-utils";
import MobileInfoDrawer from "./components/MobileInfoDrawer";
import MobileReservedBar from "./components/MobileReservedBar";
import MobileSessionInfoButton from "./components/MobileSessionInfoButton";
import SeanceInfoPanel from "./components/SeanceInfoPanel";
import SeatLegend from "./components/SeatLegend";
import SeatMapViewport from "./components/SeatMapViewport";
import FixedSeatInfoModal from "./components/FixedSeatInfoModal";
import ReservationPageLoading from "./components/ReservationPageLoading";
import {
  FALLBACK_POSTER,
  buildOverrideMap,
  fetchSeatMap,
  formatPrice,
  getCurrentUser,
  normalizeSocketUrl,
  reserveSeats,
  resolvePricingItems,
  resolvePricingOverrides,
  resolveSeatOverride,
  resolveSeanceInfo,
  sortSeatLabels,
  toSeatKeySet,
} from "./seat-map-utils";

const MIN_SCALE_FLOOR = 0.22;
const MAX_SCALE = 3;
const PAN_SLACK = 56;

const getTouchDistance = (touches) => {
  if (!touches || touches.length < 2) {
    return 0;
  }
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
};

const getTouchCenter = (touches, rect) => {
  if (!touches || touches.length < 2) {
    return { x: 0, y: 0 };
  }
  const centerX = (touches[0].clientX + touches[1].clientX) / 2;
  const centerY = (touches[0].clientY + touches[1].clientY) / 2;
  return {
    x: centerX - rect.left,
    y: centerY - rect.top,
  };
};

export default function ReservationSiegesClient({ seanceId, socketUrl }) {
  const router = useRouter();
  const [seatRows, setSeatRows] = useState([]);
  const [maxCols, setMaxCols] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [myReservation, setMyReservation] = useState(null);
  const [seanceInfo, setSeanceInfo] = useState({
    title: "Séance",
    poster: FALLBACK_POSTER,
    date: "",
    time: "",
    room: "",
    eventId: "",
    sessionStatus: "",
  });
  const [pricingItems, setPricingItems] = useState([]);
  const [pricingOverrides, setPricingOverrides] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [fixedSeatInfoModal, setFixedSeatInfoModal] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopViewportHeight, setDesktopViewportHeight] = useState(420);
  const indexRef = useRef(new Map());
  const pendingSeatActionsRef = useRef(new Map());
  const nextSeatOpRef = useRef(0);
  const selectedSeatKeysRef = useRef(new Set());
  const selectedSeatsRef = useRef([]);
  const seatRowsRef = useRef([]);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const isInteractingRef = useRef(false);
  const suppressSeatTapRef = useRef(false);
  const suppressSeatTapTimerRef = useRef(null);
  const panStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
  });
  const pinchStateRef = useRef({
    active: false,
    startDistance: 0,
    startScale: 1,
    startTranslateX: 0,
    startTranslateY: 0,
    startCenterX: 0,
    startCenterY: 0,
  });
  const transformRef = useRef({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const fitScaleRef = useRef(1);
  const layoutMetricsRef = useRef({
    viewportWidth: 0,
    viewportHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  });
  const pendingTransformRef = useRef(null);
  const rafRef = useRef(null);

  const selectedSeatKeys = useMemo(
    () => new Set(selectedSeats.map((seat) => seatKey(seat.row, seat.col))),
    [selectedSeats],
  );

  const reservationSeatKeys = useMemo(
    () => toSeatKeySet(myReservation?.seats),
    [myReservation?.seats],
  );
  const fixedSeatOverrideMap = useMemo(
    () => buildOverrideMap(pricingOverrides),
    [pricingOverrides],
  );
  const pricingById = useMemo(
    () => new Map(pricingItems.map((item) => [String(item.id), item])),
    [pricingItems],
  );
  const getFixedSeatMeta = useCallback(
    (seat) => resolveSeatOverride(seat, fixedSeatOverrideMap),
    [fixedSeatOverrideMap],
  );

  const measureLayout = useCallback(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) {
      return null;
    }

    const metrics = {
      viewportWidth: viewport.clientWidth,
      viewportHeight: viewport.clientHeight,
      canvasWidth: canvas.scrollWidth,
      canvasHeight: canvas.scrollHeight,
    };

    if (
      metrics.viewportWidth <= 0 ||
      metrics.viewportHeight <= 0 ||
      metrics.canvasWidth <= 0 ||
      metrics.canvasHeight <= 0
    ) {
      return null;
    }

    layoutMetricsRef.current = metrics;
    return metrics;
  }, []);

  const clampTransform = useCallback((next) => {
    const metrics = layoutMetricsRef.current;
    const measuredMetrics =
      metrics.viewportWidth > 0 &&
      metrics.viewportHeight > 0 &&
      metrics.canvasWidth > 0 &&
      metrics.canvasHeight > 0
        ? metrics
        : measureLayout();

    if (!measuredMetrics) {
      return next;
    }

    const { viewportWidth, viewportHeight, canvasWidth, canvasHeight } =
      measuredMetrics;

    const minScale = Math.min(fitScaleRef.current || 1, MIN_SCALE_FLOOR);
    const scale = Math.max(minScale, Math.min(MAX_SCALE, next.scale));

    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;

    if (isDesktop) {
      return {
        scale,
        translateX: (viewportWidth - scaledWidth) / 2,
        translateY: Math.max(0, (viewportHeight - scaledHeight) / 2),
      };
    }

    let minX = viewportWidth - scaledWidth - PAN_SLACK;
    let maxX = PAN_SLACK;
    if (scaledWidth <= viewportWidth) {
      const centeredX = (viewportWidth - scaledWidth) / 2;
      minX = centeredX - PAN_SLACK;
      maxX = centeredX + PAN_SLACK;
    }

    let minY = viewportHeight - scaledHeight - PAN_SLACK;
    let maxY = PAN_SLACK;
    if (scaledHeight <= viewportHeight) {
      const centeredY = (viewportHeight - scaledHeight) / 2;
      minY = centeredY - PAN_SLACK;
      maxY = centeredY + PAN_SLACK;
    }

    return {
      scale,
      translateX: Math.max(minX, Math.min(maxX, next.translateX)),
      translateY: Math.max(minY, Math.min(maxY, next.translateY)),
    };
  }, [isDesktop, measureLayout]);

  const scheduleTransformPaint = useCallback((next) => {
    pendingTransformRef.current = next;
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const current = pendingTransformRef.current;
      const canvas = canvasRef.current;
      if (!current || !canvas) {
        return;
      }

      canvas.style.transform = `translate3d(${current.translateX}px, ${current.translateY}px, 0) scale(${current.scale})`;
    });
  }, []);

  const applyTransform = useCallback(
    (next) => {
      const clamped = clampTransform(next);
      transformRef.current = clamped;
      scheduleTransformPaint(clamped);
    },
    [clampTransform, scheduleTransformPaint],
  );

  const isSeatPending = useCallback((key) => {
    return pendingSeatActionsRef.current.has(key);
  }, []);

  const mergeSelectedSeats = useCallback((reservationSeats = []) => {
    const safeReservationSeats = Array.isArray(reservationSeats)
      ? reservationSeats.filter(
          (seat) => seat && seat.row !== undefined && seat.col !== undefined,
        )
      : [];

    const reservationKeys = new Set(
      safeReservationSeats.map((seat) => seatKey(seat.row, seat.col)),
    );

    const pendingReservedSeats = selectedSeatsRef.current.filter((seat) => {
      if (!seat || seat.row === undefined || seat.col === undefined) {
        return false;
      }
      const key = seatKey(seat.row, seat.col);
      const pending = pendingSeatActionsRef.current.get(key);
      return pending?.action === "reserve" && !reservationKeys.has(key);
    });

    const pendingReserveKeys = new Set(
      pendingReservedSeats.map((seat) => seatKey(seat.row, seat.col)),
    );
    const pendingReleaseKeys = new Set(
      Array.from(pendingSeatActionsRef.current.entries())
        .filter(([, value]) => value?.action === "release")
        .map(([key]) => key),
    );

    const preserveExisting = pendingSeatActionsRef.current.size > 0;
    const stableSelectedSeats = preserveExisting
      ? selectedSeatsRef.current.filter((seat) => {
          if (!seat || seat.row === undefined || seat.col === undefined) {
            return false;
          }
          const key = seatKey(seat.row, seat.col);
          if (reservationKeys.has(key)) {
            return false;
          }
          if (pendingReserveKeys.has(key)) {
            return false;
          }
          if (pendingReleaseKeys.has(key)) {
            return false;
          }
          return true;
        })
      : [];

    const merged = new Map();
    const mergeList = (list = []) => {
      list.forEach((seat) => {
        if (!seat || seat.row === undefined || seat.col === undefined) {
          return;
        }
        merged.set(seatKey(seat.row, seat.col), {
          row: seat.row,
          col: seat.col,
        });
      });
    };

    mergeList(safeReservationSeats);
    mergeList(pendingReservedSeats);
    mergeList(stableSelectedSeats);

    return Array.from(merged.values());
  }, []);

  const syncSelectedSeats = useCallback(
    (reservationSeats = []) => {
      const merged = mergeSelectedSeats(reservationSeats);
      setSelectedSeats(merged);
      selectedSeatsRef.current = merged;
      selectedSeatKeysRef.current = new Set(
        merged.map((seat) => seatKey(seat.row, seat.col)),
      );
    },
    [mergeSelectedSeats],
  );

  const removeSelectedSeats = useCallback((seatsToRemove = []) => {
    if (!seatsToRemove.length) {
      return;
    }

    const keysToRemove = new Set(
      seatsToRemove
        .filter((seat) => seat && seat.row !== undefined && seat.col !== undefined)
        .map((seat) => seatKey(seat.row, seat.col)),
    );

    if (!keysToRemove.size) {
      return;
    }

    const nextSelected = selectedSeatsRef.current.filter(
      (seat) => !keysToRemove.has(seatKey(seat.row, seat.col)),
    );

    selectedSeatsRef.current = nextSelected;
    selectedSeatKeysRef.current = new Set(
      nextSelected.map((seat) => seatKey(seat.row, seat.col)),
    );
    setSelectedSeats(nextSelected);

    setMyReservation((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        seats: nextSelected,
      };
    });
  }, []);

  const updateSeatMap = useCallback((seatMap) => {
    const {
      rows,
      maxCols: computedMaxCols,
      indexByKey,
    } = buildSeatRows(seatMap);
    indexRef.current = indexByKey;
    setSeatRows(rows);
    setMaxCols(computedMaxCols);
  }, []);

  const updateSeatStatuses = useCallback((seats, status, options = {}) => {
    if (!seats?.length) {
      return;
    }

    const { keepSelected = false } = options;
    const seatKeys = new Set(
      seats
        .filter(
          (seat) => seat && seat.row !== undefined && seat.col !== undefined,
        )
        .map((seat) => seatKey(seat.row, seat.col)),
    );

    setSeatRows((prevRows) => {
      if (!prevRows.length || seatKeys.size === 0) {
        return prevRows;
      }

      const nextRows = [...prevRows];
      const updatedRows = new Map();

      seats.forEach((seat) => {
        if (!seat || seat.row === undefined || seat.col === undefined) {
          return;
        }

        const key = seatKey(seat.row, seat.col);
        const position = indexRef.current.get(key);

        if (!position) {
          return;
        }

        const { rowIndex, colIndex } = position;
        let row = updatedRows.get(rowIndex);

        if (!row) {
          row = { ...nextRows[rowIndex], cells: [...nextRows[rowIndex].cells] };
          updatedRows.set(rowIndex, row);
          nextRows[rowIndex] = row;
        }

        const cell = row.cells[colIndex];
        if (!cell) {
          return;
        }

        row.cells[colIndex] = { ...cell, status };
      });

      return nextRows;
    });

    if (status !== "available" && !keepSelected) {
      setSelectedSeats((prev) =>
        prev.filter((seat) => {
          const key = seatKey(seat.row, seat.col);
          if (!seatKeys.has(key)) {
            return true;
          }
          const pending = pendingSeatActionsRef.current.get(key);
          if (pending?.action) {
            return true;
          }
          return selectedSeatKeysRef.current.has(key);
        }),
      );
    }
  }, []);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
    selectedSeatKeysRef.current = new Set(
      selectedSeats.map((seat) => seatKey(seat.row, seat.col)),
    );
  }, [selectedSeats]);

  useEffect(() => {
    seatRowsRef.current = seatRows;
  }, [seatRows]);

  useEffect(() => {
    return () => {
      if (suppressSeatTapTimerRef.current) {
        clearTimeout(suppressSeatTapTimerRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsInfoDrawerOpen(false);
    setFixedSeatInfoModal(null);
  }, [seanceId]);

  useEffect(() => {
    if (!isInfoDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInfoDrawerOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(min-width: 1024px)");
    const syncDesktop = () => {
      setIsDesktop(media.matches);
    };
    syncDesktop();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncDesktop);
      return () => media.removeEventListener("change", syncDesktop);
    }

    media.addListener(syncDesktop);
    return () => media.removeListener(syncDesktop);
  }, []);

  useEffect(() => {
    const updateFit = () => {
      const metrics = measureLayout();
      if (!metrics) {
        return;
      }

      const { viewportWidth, viewportHeight, canvasWidth, canvasHeight } =
        metrics;
      let nextFitScale = Math.min(
        1,
        viewportWidth / canvasWidth,
        viewportHeight / canvasHeight,
      );

      if (isDesktop) {
        nextFitScale = Math.min(1, viewportWidth / canvasWidth);
      }

      fitScaleRef.current = nextFitScale;
      const scaledWidth = canvasWidth * nextFitScale;
      const scaledHeight = canvasHeight * nextFitScale;

      if (isDesktop) {
        setDesktopViewportHeight(Math.max(360, Math.ceil(scaledHeight + 4)));
      } else {
        setDesktopViewportHeight(420);
      }

      applyTransform({
        scale: nextFitScale,
        translateX: (viewportWidth - scaledWidth) / 2,
        translateY: isDesktop ? 0 : (viewportHeight - scaledHeight) / 2,
      });
    };

    updateFit();
    window.addEventListener("resize", updateFit);

    return () => {
      window.removeEventListener("resize", updateFit);
    };
  }, [applyTransform, isDesktop, maxCols, measureLayout, seatRows.length]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadSeatMap = async () => {
      if (!seanceId) {
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const { ok, status, data } = await fetchSeatMap(seanceId, {
          signal: controller.signal,
        });

        if (!ok) {
          if (status === 409) {
            const serverStatus = String(
              data?.sessionStatus || data?.session?.status || "completed",
            )
              .trim()
              .toLowerCase();
            setSeanceInfo((prev) => ({
              ...prev,
              sessionStatus: serverStatus || "completed",
            }));
            setLoadError("");
            return;
          }
          throw new Error("Impossible de charger la salle.");
        }

        if (!active) {
          return;
        }

        const seatMap = Array.isArray(data?.seatMap) ? data.seatMap : [];
        updateSeatMap(seatMap);
        setSeanceInfo(resolveSeanceInfo(data));
        setPricingItems(resolvePricingItems(data));
        setPricingOverrides(resolvePricingOverrides(data));

        const reservation = normalizeReservationResponse({
          reservation: data?.myReservation,
        });
        if (reservation.reservationId && reservation.seats.length > 0) {
          setMyReservation({
            reservationId: reservation.reservationId,
            expiresAt: reservation.expiresAt,
            seats: reservation.seats,
          });
          syncSelectedSeats(reservation.seats);
        } else {
          setMyReservation(null);
          setSelectedSeats([]);
        }
      } catch (error) {
        if (!active || error.name === "AbortError") {
          return;
        }
        setLoadError("Impossible de charger le plan de salle.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    pendingSeatActionsRef.current.clear();
    selectedSeatsRef.current = [];
    selectedSeatKeysRef.current = new Set();
    setSelectedSeats([]);
    setMyReservation(null);
    setPricingItems([]);
    setPricingOverrides([]);
    loadSeatMap();

    return () => {
      active = false;
      controller.abort();
    };
  }, [seanceId, syncSelectedSeats, updateSeatMap]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const user = await getCurrentUser();
      if (!active) {
        return;
      }
      setUserId(user?._id || user?.id || "");
    };

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const resolvedSocketUrl = normalizeSocketUrl(socketUrl);
    const isSessionUnavailable =
      Boolean(seanceInfo.sessionStatus) &&
      seanceInfo.sessionStatus !== "in_progress";
    if (!resolvedSocketUrl || !seanceId || isSessionUnavailable) {
      return undefined;
    }

    const socket = io(resolvedSocketUrl);

    socket.emit("join-session", { sessionId: seanceId });

    const handleReserved = (payload) => {
      const payloadUserId = payload?.userId ? String(payload.userId) : "";
      const isCurrentUser = payloadUserId && payloadUserId === String(userId);
      const payloadSeats = normalizeSeatsPayload(payload);

      if (!isCurrentUser) {
        const otherSeats = [];

        payloadSeats.forEach((seat) => {
          if (!seat || seat.row === undefined || seat.col === undefined) {
            return;
          }

          const key = seatKey(seat.row, seat.col);
          if (isSeatPending(key) || selectedSeatKeysRef.current.has(key)) {
            return;
          }

          otherSeats.push(seat);
        });

        if (otherSeats.length) {
          updateSeatStatuses(otherSeats, "reserved");
        }

        return;
      }

      const reservation = normalizeReservationResponse(payload);
      if (!reservation.reservationId || reservation.seats.length === 0) {
        return;
      }

      setMyReservation({
        reservationId: reservation.reservationId,
        expiresAt: reservation.expiresAt,
        seats: reservation.seats,
      });
      syncSelectedSeats(reservation.seats);
    };

    const handleReleased = (payload) => {
      const payloadSeats = normalizeSeatsPayload(payload);

      const payloadUserId = payload?.userId ? String(payload.userId) : "";
      const isCurrentUser = payloadUserId && payloadUserId === String(userId);
      if (!isCurrentUser) {
        const releasableSeats = [];

        payloadSeats.forEach((seat) => {
          if (!seat || seat.row === undefined || seat.col === undefined) {
            return;
          }

          const key = seatKey(seat.row, seat.col);
          if (isSeatPending(key) || selectedSeatKeysRef.current.has(key)) {
            return;
          }

          releasableSeats.push(seat);
        });

        if (releasableSeats.length) {
          updateSeatStatuses(releasableSeats, "available");
        }

        return;
      }

      if (payloadSeats.length) {
        updateSeatStatuses(payloadSeats, "available");
      }

      const reservation = normalizeReservationResponse(payload);
      if (reservation.reservationId && reservation.seats.length > 0) {
        setMyReservation({
          reservationId: reservation.reservationId,
          expiresAt: reservation.expiresAt,
          seats: reservation.seats,
        });
        syncSelectedSeats(reservation.seats);
        return;
      }

      if (payloadSeats.length) {
        removeSelectedSeats(payloadSeats);
        if (
          selectedSeatsRef.current.length === 0 &&
          pendingSeatActionsRef.current.size === 0
        ) {
          setMyReservation(null);
        }
        return;
      }

      if (pendingSeatActionsRef.current.size === 0) {
        setMyReservation(null);
        setSelectedSeats([]);
        selectedSeatsRef.current = [];
        selectedSeatKeysRef.current = new Set();
      }
    };

    const handleBooked = (payload) => {
      updateSeatStatuses(normalizeSeatsPayload(payload), "booked");
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error?.message || error);
    };

    socket.on("seats-reserved", handleReserved);
    socket.on("seats-released", handleReleased);
    socket.on("seats-booked", handleBooked);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.emit("leave-session", { sessionId: seanceId });
      socket.off("seats-reserved", handleReserved);
      socket.off("seats-released", handleReleased);
      socket.off("seats-booked", handleBooked);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [
    isSeatPending,
    removeSelectedSeats,
    seanceId,
    socketUrl,
    syncSelectedSeats,
    updateSeatStatuses,
    userId,
    seanceInfo.sessionStatus,
  ]);

  const handleToggleSeat = useCallback(
    async (cell) => {
      if (!cell) {
        return;
      }

      if (suppressSeatTapRef.current) {
        return;
      }

      const key = seatKey(cell.row, cell.col);
      const fixedSeatMeta = getFixedSeatMeta(cell);
      const exists = selectedSeatKeysRef.current.has(key);
      const action = exists ? "release" : "reserve";
      const toggledSeat = { row: cell.row, col: cell.col };

      const pending = pendingSeatActionsRef.current.get(key);
      if (pending?.action === action) {
        return;
      }

      const prevSelectedSeats = selectedSeatsRef.current;
      const position = indexRef.current.get(key);
      const prevStatus = position
        ? seatRowsRef.current?.[position.rowIndex]?.cells?.[position.colIndex]
            ?.status
        : undefined;
      const fallbackStatus = exists ? "reserved" : "available";
      const nextSelectedSeats = exists
        ? prevSelectedSeats.filter(
            (item) => seatKey(item.row, item.col) !== key,
          )
        : [...prevSelectedSeats, toggledSeat];

      const opId = nextSeatOpRef.current + 1;
      nextSeatOpRef.current = opId;
      pendingSeatActionsRef.current.set(key, { action, opId });

      selectedSeatsRef.current = nextSelectedSeats;
      selectedSeatKeysRef.current = new Set(
        nextSelectedSeats.map((item) => seatKey(item.row, item.col)),
      );
      setSelectedSeats(nextSelectedSeats);
      updateSeatStatuses([toggledSeat], exists ? "available" : "reserved", {
        keepSelected: true,
      });

      let errorMessage = "";

      try {
        const { ok, status, data } = await reserveSeats({
          sessionId: seanceId,
          seats: [toggledSeat],
          action,
        });

        if (status === 409) {
          errorMessage = "Ce siege vient d'etre reserve. Veuillez reessayer.";
          throw new Error("conflict");
        }

        if (status === 401) {
          errorMessage = "Session expirée. Veuillez recharger la page.";
          throw new Error("unauthorized");
        }

        if (!ok) {
          errorMessage = data?.message || "Impossible de reserver.";
          throw new Error("reserve_failed");
        }

        if (pendingSeatActionsRef.current.get(key)?.opId !== opId) {
          return;
        }

        const reservation = normalizeReservationResponse(data);
        if (!reservation.reservationId || reservation.seats.length === 0) {
          setMyReservation(null);
          setSelectedSeats([]);
          selectedSeatsRef.current = [];
          selectedSeatKeysRef.current = new Set();
        } else {
          setMyReservation({
            reservationId: reservation.reservationId,
            expiresAt: reservation.expiresAt,
            seats: reservation.seats,
          });
          syncSelectedSeats(reservation.seats);
        }

        if (!exists && fixedSeatMeta) {
          const seatLabel = `${cell.row}${cell.col}`;
          const pricingId = fixedSeatMeta.id
            ? String(fixedSeatMeta.id)
            : cell?.pricingOverrideId
              ? String(cell.pricingOverrideId)
              : "";
          const pricing = pricingId ? pricingById.get(pricingId) : null;
          const pricingName = String(
            fixedSeatMeta.name || pricing?.name || "Tarif fixe",
          );
          const pricingValue = fixedSeatMeta.price ?? pricing?.price ?? null;
          const pricingPriceLabel =
            pricingValue !== null && pricingValue !== undefined
              ? formatPrice(pricingValue)
              : "Prix non defini";

          setFixedSeatInfoModal({
            seatLabel,
            pricingName,
            pricingPriceLabel,
          });
        }
      } catch (error) {
        if (pendingSeatActionsRef.current.get(key)?.opId !== opId) {
          return;
        }
        alert(errorMessage || "Une erreur est survenue. Merci de reessayer.");
        setSelectedSeats(prevSelectedSeats);
        selectedSeatsRef.current = prevSelectedSeats;
        selectedSeatKeysRef.current = new Set(
          prevSelectedSeats.map((item) => seatKey(item.row, item.col)),
        );
        updateSeatStatuses([toggledSeat], prevStatus ?? fallbackStatus, {
          keepSelected: true,
        });
      } finally {
        if (pendingSeatActionsRef.current.get(key)?.opId === opId) {
          pendingSeatActionsRef.current.delete(key);
        }
      }
    },
    [getFixedSeatMeta, pricingById, seanceId, syncSelectedSeats, updateSeatStatuses],
  );

  const handleSeatTouchEnd = useCallback(
    (event, cell) => {
      if (event?.cancelable) {
        event.preventDefault();
      }

      if (suppressSeatTapRef.current) {
        return;
      }

      handleToggleSeat(cell);
    },
    [handleToggleSeat],
  );

  const handleTouchStart = useCallback(
    (event) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const touches = event.touches;
      if (!touches || touches.length === 0) {
        return;
      }

      if (touches.length === 1) {
        if (event.cancelable) {
          event.preventDefault();
        }
        panStateRef.current = {
          active: true,
          startX: touches[0].clientX,
          startY: touches[0].clientY,
          startTranslateX: transformRef.current.translateX,
          startTranslateY: transformRef.current.translateY,
        };
        pinchStateRef.current.active = false;
        isInteractingRef.current = false;
        return;
      }

      if (touches.length >= 2) {
        if (event.cancelable) {
          event.preventDefault();
        }
        const rect = viewport.getBoundingClientRect();
        const distance = getTouchDistance(touches);
        const center = getTouchCenter(touches, rect);

        pinchStateRef.current = {
          active: true,
          startDistance: distance,
          startScale: transformRef.current.scale,
          startTranslateX: transformRef.current.translateX,
          startTranslateY: transformRef.current.translateY,
          startCenterX: center.x,
          startCenterY: center.y,
        };
        panStateRef.current.active = false;
        isInteractingRef.current = false;
      }
    },
    [],
  );

  const handleTouchMove = useCallback(
    (event) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const touches = event.touches;
      if (!touches || touches.length === 0) {
        return;
      }

      if (touches.length >= 2 && pinchStateRef.current.active) {
        if (event.cancelable) {
          event.preventDefault();
        }
        const rect = viewport.getBoundingClientRect();
        const distance = getTouchDistance(touches);
        const center = getTouchCenter(touches, rect);
        if (!distance || !pinchStateRef.current.startDistance) {
          return;
        }

        const pinchRatio = distance / pinchStateRef.current.startDistance;
        const baseScale = pinchStateRef.current.startScale;
        const nextScale = baseScale * pinchRatio;

        const sourceX =
          (pinchStateRef.current.startCenterX -
            pinchStateRef.current.startTranslateX) /
          baseScale;
        const sourceY =
          (pinchStateRef.current.startCenterY -
            pinchStateRef.current.startTranslateY) /
          baseScale;

        const nextTranslateX =
          center.x -
          sourceX * nextScale +
          (center.x - pinchStateRef.current.startCenterX);
        const nextTranslateY =
          center.y -
          sourceY * nextScale +
          (center.y - pinchStateRef.current.startCenterY);

        isInteractingRef.current = true;
        applyTransform({
          scale: nextScale,
          translateX: nextTranslateX,
          translateY: nextTranslateY,
        });
        return;
      }

      if (touches.length === 1 && panStateRef.current.active) {
        if (event.cancelable) {
          event.preventDefault();
        }
        const deltaX = touches[0].clientX - panStateRef.current.startX;
        const deltaY = touches[0].clientY - panStateRef.current.startY;
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          isInteractingRef.current = true;
        }

        applyTransform({
          scale: transformRef.current.scale,
          translateX: panStateRef.current.startTranslateX + deltaX,
          translateY: panStateRef.current.startTranslateY + deltaY,
        });
      }
    },
    [applyTransform],
  );

  const handleTouchEnd = useCallback(() => {
    if (pinchStateRef.current.active || panStateRef.current.active) {
      if (isInteractingRef.current) {
        suppressSeatTapRef.current = true;
        if (suppressSeatTapTimerRef.current) {
          clearTimeout(suppressSeatTapTimerRef.current);
        }
        suppressSeatTapTimerRef.current = setTimeout(() => {
          suppressSeatTapRef.current = false;
        }, 180);
      }
    }

    const panState = panStateRef.current;
    panState.active = false;
    pinchStateRef.current.active = false;
    isInteractingRef.current = false;
  }, []);

  useEffect(() => {
    if (isDesktop) {
      return undefined;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const onTouchStart = (event) => {
      handleTouchStart(event);
    };
    const onTouchMove = (event) => {
      handleTouchMove(event);
    };
    const onTouchEnd = () => {
      handleTouchEnd();
    };

    viewport.addEventListener("touchstart", onTouchStart, { passive: false });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
      viewport.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart, isDesktop]);

  const seatCellSize = 34;
  const gridGap = 3;
  const safeMaxCols = Math.max(maxCols || 1, 1);
  const seatGridWidth = safeMaxCols * seatCellSize + (safeMaxCols - 1) * gridGap;
  const sessionDateTime = [seanceInfo.date, seanceInfo.time]
    .filter(Boolean)
    .join(" • ");
  const reservedSeatLabels = useMemo(
    () => sortSeatLabels(selectedSeats),
    [selectedSeats],
  );
  const isSessionUnavailable = Boolean(
    !isLoading &&
      seanceInfo.sessionStatus &&
      seanceInfo.sessionStatus !== "in_progress",
  );

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/evenements");
  }, [router]);

  const handleChangeSeance = useCallback(() => {
    if (!seanceInfo.eventId) {
      return;
    }
    setIsInfoDrawerOpen(false);
    router.push(`/evenements/${seanceInfo.eventId}`);
  }, [router, seanceInfo.eventId]);
  const canGoCheckout = Boolean(
    myReservation?.reservationId && (myReservation?.seats?.length || 0) > 0,
  );
  const handleGoCheckout = useCallback(() => {
    if (!canGoCheckout || isSessionUnavailable) {
      return;
    }
    router.push(`/reserver-siege/${seanceId}/checkout`);
  }, [canGoCheckout, isSessionUnavailable, router, seanceId]);

  if (isLoading) {
    return <ReservationPageLoading />;
  }

  if (isSessionUnavailable) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-4xl items-center justify-center px-4 py-10">
        <section className="w-full rounded-2xl border border-white/10 bg-[#161e22]/80 px-6 py-10 text-center shadow-2xl backdrop-blur-xl sm:px-10">
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Désolé, cette séance n&apos;est pas disponible
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/65 sm:text-base">
            Nous vous invitons à choisir une autre séance, en cliquant sur ce
            bouton
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110"
          >
            Trouver une séance
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mt-3 flex flex-col gap-3 px-2 pt-2 pb-24 lg:mt-4 lg:flex-row lg:items-start lg:px-16 lg:pt-0 lg:pb-3">
      <section className="flex-1 lg:pr-4">
        <div className="flex flex-col items-center gap-4 lg:items-stretch">
          <div className="w-full">
            <button
              type="button"
              onClick={handleGoBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80"
              aria-label="Retour"
            >
              <RiArrowLeftSLine className="h-6 w-6" />
            </button>
          </div>

          <MobileSessionInfoButton
            seanceInfo={seanceInfo}
            sessionDateTime={sessionDateTime}
            onOpen={() => setIsInfoDrawerOpen(true)}
          />

          <SeatMapViewport
            viewportRef={viewportRef}
            canvasRef={canvasRef}
            isDesktop={isDesktop}
            desktopViewportHeight={desktopViewportHeight}
            seatRows={seatRows}
            maxCols={maxCols}
            seatGridWidth={seatGridWidth}
            seatCellSize={seatCellSize}
            gridGap={gridGap}
            selectedSeatKeys={selectedSeatKeys}
            reservationSeatKeys={reservationSeatKeys}
            isLoading={isLoading}
            loadError={loadError}
            onToggleSeat={handleToggleSeat}
            onTouchSeatEnd={handleSeatTouchEnd}
            getFixedSeatMeta={getFixedSeatMeta}
          />

          <SeatLegend />
        </div>
      </section>

      <aside className="hidden w-full shrink-0 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:block lg:w-[360px] lg:p-8">
        <SeanceInfoPanel
          seanceInfo={seanceInfo}
          pricingItems={pricingItems}
          formatPrice={formatPrice}
        />
        <div className="mt-8 border-t border-white/10 pt-6">
          <button
            onClick={handleGoCheckout}
            disabled={!canGoCheckout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-accent py-4 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:brightness-110"
            type="button"
          >
            Valider la selection
          </button>
        </div>
      </aside>

      <MobileInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={() => setIsInfoDrawerOpen(false)}
        onChangeSeance={handleChangeSeance}
        canChangeSeance={Boolean(seanceInfo.eventId)}
      >
        <SeanceInfoPanel
          seanceInfo={seanceInfo}
          pricingItems={pricingItems}
          formatPrice={formatPrice}
        />
      </MobileInfoDrawer>

      <MobileReservedBar
        reservedSeatLabels={reservedSeatLabels}
        canGoCheckout={canGoCheckout}
        onConfirm={handleGoCheckout}
      />

      <FixedSeatInfoModal
        seatInfo={fixedSeatInfoModal}
        onClose={() => setFixedSeatInfoModal(null)}
      />
    </main>
  );
}
