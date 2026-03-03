"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { RiArrowLeftSLine, RiTicketLine } from "react-icons/ri";

import { normalizeReservationResponse } from "@/app/lib/reservation-utils";
import { normalizeSeatsPayload, seatKey } from "@/app/lib/seat-utils";
import CheckoutAuthModal from "./components/CheckoutAuthModal";
import CheckoutSidebar from "./components/CheckoutSidebar";
import CheckoutStateAlerts from "./components/CheckoutStateAlerts";
import CheckoutTotalCard from "./components/CheckoutTotalCard";
import FixedPricingCard from "./components/FixedPricingCard";
import PricingQuantityList from "./components/PricingQuantityList";
import PromoCodeCard from "./components/PromoCodeCard";
import SubscriptionPaymentCard from "./components/SubscriptionPaymentCard";
import CheckoutPageLoading from "./components/CheckoutPageLoading";
import {
  FALLBACK_POSTER,
  EXPIRED_RESERVATION_MESSAGE,
  CHECKOUT_INTENT_STORAGE_KEY,
  SUCCESS_BOOKING_STORAGE_KEY,
  buildOverrideMap,
  formatPrice,
  formatSeatLabel,
  isValidEmail,
  normalizePromoCode,
  normalizeSocketUrl,
  normalizeSubscriptionCode,
  resolvePricingItems,
  resolvePricingOverrides,
  resolveRedirectPath,
  resolveSeatOverride,
  resolveSeanceInfo,
  toNumber,
} from "./checkout-utils";

export default function ReservationCheckoutClient({ seanceId, socketUrl }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reservation, setReservation] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seanceInfo, setSeanceInfo] = useState({
    title: "Séance",
    poster: FALLBACK_POSTER,
    genre: "",
    duration: "",
    date: "",
    time: "",
    room: "",
    eventId: "",
  });
  const [pricingItems, setPricingItems] = useState([]);
  const [pricingOverrides, setPricingOverrides] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [expiredReservationMessage, setExpiredReservationMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("guest");
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
    booking: null,
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState("choice");
  const [guestContact, setGuestContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [guestFormError, setGuestFormError] = useState("");
  const [subscriptionCodeInput, setSubscriptionCodeInput] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoState, setPromoState] = useState({
    status: "idle",
    message: "",
    promo: null,
    pricing: null,
  });
  const reservationRef = useRef(null);
  const reservationSeatKeysRef = useRef(new Set());
  const autoFinalizeAttemptedRef = useRef(false);
  const promoValidationContextRef = useRef({ subtotal: 0, seatsCount: 0 });
  const hasRedirectedForMissingReservationRef = useRef(false);

  const applyCheckoutData = useCallback(
    (data, { markExpiredWhenMissing = false, hadReservationBefore = false } = {}) => {
      const normalized = normalizeReservationResponse({
        reservation: data?.reservation,
      });
      const normalizedSeats = Array.isArray(normalized.seats) ? normalized.seats : [];
      const hasReservation = Boolean(
        normalized.reservationId && normalizedSeats.length > 0,
      );

      if (hasReservation) {
        setReservation({
          reservationId: normalized.reservationId,
          expiresAt: normalized.expiresAt,
          seats: normalizedSeats,
        });
        setSeats(normalizedSeats);
        setExpiredReservationMessage("");
      } else {
        setReservation(null);
        setSeats([]);
        setQuantities({});
        if (markExpiredWhenMissing && hadReservationBefore) {
          setExpiredReservationMessage(EXPIRED_RESERVATION_MESSAGE);
        } else {
          setExpiredReservationMessage("");
        }
      }

      setSeanceInfo(resolveSeanceInfo(data || {}));
      setPricingItems(resolvePricingItems(data || {}));
      setPricingOverrides(resolvePricingOverrides(data || {}));
    },
    [],
  );

  const refreshCheckout = useCallback(
    async ({ signal, markExpiredWhenMissing = false, suppressErrors = false } = {}) => {
      if (!seanceId) {
        if (!suppressErrors) {
          setErrorMessage("Séance invalide.");
        }
        return false;
      }

      try {
        const response = await fetch(`/api/reservations/session/${seanceId}/me`, {
          cache: "no-store",
          signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Impossible de charger la réservation.");
        }

        const hadReservationBefore = Boolean(
          reservationRef.current?.reservationId &&
            (reservationRef.current?.seats?.length || 0) > 0,
        );

        setErrorMessage("");
        applyCheckoutData(data, {
          markExpiredWhenMissing,
          hadReservationBefore,
        });
        return true;
      } catch (error) {
        if (error?.name === "AbortError") {
          return false;
        }
        if (!suppressErrors) {
          setErrorMessage(
            error?.message || "Impossible de charger la réservation.",
          );
        }
        return false;
      }
    },
    [applyCheckoutData, seanceId],
  );

  const markReservationExpired = useCallback(() => {
    const hasReservation = Boolean(
      reservationRef.current?.reservationId &&
        (reservationRef.current?.seats?.length || 0) > 0,
    );
    if (!hasReservation) {
      return;
    }

    setReservation(null);
    setSeats([]);
    setQuantities({});
    setSubmitState({ status: "idle", message: "", booking: null });
    setExpiredReservationMessage(EXPIRED_RESERVATION_MESSAGE);
  }, []);

  const redirectToPreviousOrHome = useCallback(() => {
    if (typeof window === "undefined") {
      router.replace("/");
      return;
    }

    const canGoBack = (() => {
      if (window.history.length <= 1 || !document.referrer) {
        return false;
      }

      try {
        const referrerUrl = new URL(document.referrer);
        return referrerUrl.origin === window.location.origin;
      } catch (_error) {
        return false;
      }
    })();

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace("/");
  }, [router]);

  useEffect(() => {
    reservationRef.current = reservation;
  }, [reservation]);

  useEffect(() => {
    const currentSeats = Array.isArray(seats)
      ? seats.filter((seat) => seat && seat.row !== undefined && seat.col !== undefined)
      : [];

    reservationSeatKeysRef.current = new Set(
      currentSeats.map((seat) => seatKey(seat.row, seat.col)),
    );
  }, [seats]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (!active) {
          return;
        }
        const resolvedUserId = data?.user?._id || data?.user?.id || "";
        const resolvedRole = data?.user?.role || "guest";
        setUserId(String(resolvedUserId || ""));
        setUserRole(String(resolvedRole || "guest"));
      } catch (_error) {
        // noop
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadCheckout = async () => {
      if (!seanceId) {
        if (active) {
          setIsLoading(false);
          setErrorMessage("Séance invalide.");
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setSubmitState({ status: "idle", message: "", booking: null });
      setExpiredReservationMessage("");
      setQuantities({});
      setPromoCodeInput("");
      setPromoState({ status: "idle", message: "", promo: null, pricing: null });
      promoValidationContextRef.current = { subtotal: 0, seatsCount: 0 };
      autoFinalizeAttemptedRef.current = false;
      hasRedirectedForMissingReservationRef.current = false;

      try {
        await refreshCheckout({ signal: controller.signal });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadCheckout();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCheckout, seanceId]);

  useEffect(() => {
    if (isLoading || errorMessage) {
      return;
    }

    const hasReservation = Boolean(
      reservation?.reservationId && (reservation?.seats?.length || 0) > 0,
    );

    if (hasReservation || hasRedirectedForMissingReservationRef.current) {
      return;
    }

    hasRedirectedForMissingReservationRef.current = true;
    redirectToPreviousOrHome();
  }, [
    errorMessage,
    isLoading,
    redirectToPreviousOrHome,
    reservation?.reservationId,
    reservation?.seats?.length,
  ]);

  useEffect(() => {
    if (!reservation?.expiresAt) {
      return undefined;
    }

    const expiresAtTs = new Date(reservation.expiresAt).getTime();
    if (!Number.isFinite(expiresAtTs)) {
      return undefined;
    }

    let timeoutId;

    const scheduleExpiryCheck = () => {
      const remainingMs = expiresAtTs - Date.now();
      if (remainingMs <= 0) {
        markReservationExpired();
        refreshCheckout({
          markExpiredWhenMissing: true,
          suppressErrors: true,
        });
        return;
      }

      timeoutId = window.setTimeout(
        scheduleExpiryCheck,
        Math.min(remainingMs, 1000),
      );
    };

    scheduleExpiryCheck();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [markReservationExpired, refreshCheckout, reservation?.expiresAt]);

  useEffect(() => {
    const resolvedSocketUrl = normalizeSocketUrl(socketUrl);
    if (!resolvedSocketUrl || !seanceId) {
      return undefined;
    }

    const socket = io(resolvedSocketUrl);
    socket.emit("join-session", { sessionId: seanceId });

    const touchesCurrentReservation = (payload) => {
      const payloadSeats = normalizeSeatsPayload(payload);
      if (!payloadSeats.length || !reservationSeatKeysRef.current.size) {
        return false;
      }

      return payloadSeats.some((seat) => {
        if (!seat || seat.row === undefined || seat.col === undefined) {
          return false;
        }
        return reservationSeatKeysRef.current.has(seatKey(seat.row, seat.col));
      });
    };

    const handleReleased = (payload) => {
      const payloadUserId = payload?.userId ? String(payload.userId) : "";
      const isCurrentUser = Boolean(
        payloadUserId && userId && payloadUserId === String(userId),
      );
      const reason = String(payload?.reason || "").toLowerCase();
      const impacted = touchesCurrentReservation(payload);

      if (!isCurrentUser && !impacted) {
        return;
      }

      if (reason === "expired") {
        markReservationExpired();
        refreshCheckout({
          markExpiredWhenMissing: true,
          suppressErrors: true,
        });
        return;
      }

      refreshCheckout({ suppressErrors: true });
    };

    const handleBooked = (payload) => {
      if (!touchesCurrentReservation(payload)) {
        return;
      }
      refreshCheckout({ suppressErrors: true });
    };

    const handleReserved = (payload) => {
      const payloadUserId = payload?.userId ? String(payload.userId) : "";
      const isCurrentUser = Boolean(
        payloadUserId && userId && payloadUserId === String(userId),
      );
      const payloadReservationId = payload?.reservationId
        ? String(payload.reservationId)
        : "";
      const currentReservationId = reservationRef.current?.reservationId
        ? String(reservationRef.current.reservationId)
        : "";
      const sameReservation = Boolean(
        payloadReservationId &&
          currentReservationId &&
          payloadReservationId === currentReservationId,
      );

      if (!isCurrentUser && !sameReservation) {
        return;
      }
      refreshCheckout({ suppressErrors: true });
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error?.message || error);
    };

    socket.on("seats-released", handleReleased);
    socket.on("seats-booked", handleBooked);
    socket.on("seats-reserved", handleReserved);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.emit("leave-session", { sessionId: seanceId });
      socket.off("seats-released", handleReleased);
      socket.off("seats-booked", handleBooked);
      socket.off("seats-reserved", handleReserved);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [
    markReservationExpired,
    refreshCheckout,
    seanceId,
    socketUrl,
    userId,
  ]);

  const safeSeats = useMemo(
    () =>
      Array.isArray(seats)
        ? seats.filter((seat) => seat && seat.row !== undefined && seat.col !== undefined)
        : [],
    [seats],
  );

  const safePricingItems = useMemo(
    () =>
      Array.isArray(pricingItems)
        ? pricingItems.filter((item) => item && item.name)
        : [],
    [pricingItems],
  );

  const overrideMap = useMemo(
    () => buildOverrideMap(pricingOverrides, seatKey),
    [pricingOverrides],
  );

  const fixedSeats = useMemo(
    () =>
      safeSeats.filter((seat) => Boolean(resolveSeatOverride(seat, overrideMap, seatKey))),
    [overrideMap, safeSeats],
  );

  const assignableSeatsCount = Math.max(safeSeats.length - fixedSeats.length, 0);

  const fixedPricingGroups = useMemo(() => {
    if (!fixedSeats.length) {
      return [];
    }

    const groups = new Map();

    fixedSeats.forEach((seat) => {
      const override = resolveSeatOverride(seat, overrideMap, seatKey);
      if (!override) {
        return;
      }

      const key = `${override.id || override.name}|${override.price ?? ""}`;
      const current = groups.get(key) || {
        key,
        label: override.name || "Tarif fixe",
        price: override.price,
        seats: [],
      };

      current.seats.push(formatSeatLabel(seat));
      groups.set(key, current);
    });

    return Array.from(groups.values());
  }, [fixedSeats, overrideMap]);

  const fixedTotal = useMemo(
    () =>
      fixedPricingGroups.reduce(
        (sum, group) => sum + toNumber(group.price) * group.seats.length,
        0,
      ),
    [fixedPricingGroups],
  );

  const assignedCount = useMemo(
    () =>
      Object.values(quantities).reduce(
        (sum, value) => sum + (Number.isFinite(value) ? value : 0),
        0,
      ),
    [quantities],
  );

  const remainingToAssign = Math.max(assignableSeatsCount - assignedCount, 0);

  const variableTotal = useMemo(
    () =>
      safePricingItems.reduce((sum, item, index) => {
        const itemKey = String(item?.id ?? item?.name ?? index);
        const quantity = quantities[itemKey] || 0;
        return sum + quantity * toNumber(item?.price);
      }, 0),
    [quantities, safePricingItems],
  );

  const totalPrice = fixedTotal + variableTotal;
  const normalizedSubscriptionCode = useMemo(
    () => normalizeSubscriptionCode(subscriptionCodeInput),
    [subscriptionCodeInput],
  );
  const normalizedPromoCode = useMemo(
    () => normalizePromoCode(promoCodeInput),
    [promoCodeInput],
  );
  const isSubscriptionPaymentRequested =
    userRole === "customer" && Boolean(normalizedSubscriptionCode);
  const isPromoApplied =
    promoState.status === "applied" && Boolean(promoState?.promo?.code);
  const appliedPromoCode = isPromoApplied ? String(promoState.promo.code) : "";
  const promoDiscountAmount = isPromoApplied
    ? toNumber(promoState?.pricing?.discountAmount)
    : 0;
  const promoReductionLabel = isPromoApplied
    ? promoState?.promo?.reductionType === "percent"
      ? `${toNumber(promoState?.promo?.reductionValue)}%`
      : formatPrice(promoState?.promo?.reductionValue)
    : "";
  const creditsToUseWithSubscription = safeSeats.length;
  const payableTotal = isSubscriptionPaymentRequested
    ? 0
    : Math.max(totalPrice - promoDiscountAmount, 0);
  const isSubmitting = submitState.status === "loading";
  const isSuccess = submitState.status === "success";
  const canValidatePromo =
    !isSubmitting &&
    !isSuccess &&
    !isSubscriptionPaymentRequested &&
    safeSeats.length > 0 &&
    remainingToAssign === 0 &&
    Boolean(normalizedPromoCode);

  const canAdjust =
    Boolean(reservation) &&
    assignableSeatsCount > 0 &&
    !isSubmitting &&
    !isSuccess;
  const canContinue =
    Boolean(reservation) &&
    safeSeats.length > 0 &&
    remainingToAssign === 0 &&
    !isSubmitting &&
    !isSuccess;

  const seatLabels = useMemo(
    () => safeSeats.map(formatSeatLabel).filter(Boolean),
    [safeSeats],
  );

  const handleIncrement = useCallback(
    (itemKey) => {
      if (!canAdjust || isSubmitting || isSuccess) {
        return;
      }

      setQuantities((prev) => {
        const currentAssigned = Object.values(prev).reduce(
          (sum, value) => sum + (Number.isFinite(value) ? value : 0),
          0,
        );
        if (currentAssigned >= assignableSeatsCount) {
          return prev;
        }

        const nextValue = (prev[itemKey] || 0) + 1;
        return { ...prev, [itemKey]: nextValue };
      });
    },
    [assignableSeatsCount, canAdjust, isSubmitting, isSuccess],
  );

  const handleDecrement = useCallback(
    (itemKey) => {
      if (!canAdjust || isSubmitting || isSuccess) {
        return;
      }

      setQuantities((prev) => {
        const currentValue = prev[itemKey] || 0;
        if (currentValue <= 0) {
          return prev;
        }
        return { ...prev, [itemKey]: currentValue - 1 };
      });
    },
    [canAdjust, isSubmitting, isSuccess],
  );

  const buildPricingSelectionsFromQuantities = useCallback(
    (sourceQuantities = quantities) =>
      safePricingItems
        .map((item, index) => {
          const itemKey = String(item?.id ?? item?.name ?? index);
          const quantity = sourceQuantities[itemKey] || 0;
          if (!quantity) {
            return null;
          }

          return {
            pricingId: item?.id ?? null,
            name: item?.name || "",
            price: item?.price,
            quantity,
          };
        })
        .filter(Boolean),
    [quantities, safePricingItems],
  );

  const totalSelectionCount = useCallback(
    (selections = []) =>
      (Array.isArray(selections) ? selections : []).reduce((sum, selection) => {
        const quantity = Number.parseInt(selection?.quantity ?? 0, 10);
        return sum + (Number.isFinite(quantity) ? quantity : 0);
      }, 0),
    [],
  );

  const persistCheckoutIntent = useCallback(
    (selections, subscriptionCode = "", promoCode = "") => {
      if (typeof window === "undefined") {
        return;
      }

      const payload = {
        seanceId,
        reservationId: reservation?.reservationId || "",
        selections: Array.isArray(selections) ? selections : [],
        subscriptionCode: normalizeSubscriptionCode(subscriptionCode),
        promoCode: normalizePromoCode(promoCode),
        createdAt: Date.now(),
      };

      try {
        window.sessionStorage.setItem(
          CHECKOUT_INTENT_STORAGE_KEY,
          JSON.stringify(payload),
        );
      } catch (_error) {
        // noop
      }
    },
    [reservation?.reservationId, seanceId],
  );

  const readCheckoutIntent = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_INTENT_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return parsed;
    } catch (_error) {
      return null;
    }
  }, []);

  const clearCheckoutIntent = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.sessionStorage.removeItem(CHECKOUT_INTENT_STORAGE_KEY);
    } catch (_error) {
      // noop
    }
  }, []);

  const persistSuccessBooking = useCallback(
    ({ booking, selections, customerContact, subscriptionCode, promoCode } = {}) => {
      if (typeof window === "undefined") {
        return;
      }

      const payload = {
        booking: booking || null,
        seanceId: String(seanceId || ""),
        seanceInfo: seanceInfo || null,
        seats: safeSeats
          .filter((seat) => seat && seat.row !== undefined && seat.col !== undefined)
          .map((seat) => ({
            row: String(seat.row),
            col: Number(seat.col),
          })),
        pricingSelections: Array.isArray(selections) ? selections : [],
        totalAmount: Number.isFinite(toNumber(booking?.totalAmount))
          ? toNumber(booking?.totalAmount)
          : totalPrice,
        customerContact: customerContact || null,
        subscriptionCode: normalizeSubscriptionCode(
          booking?.subscriptionTransaction?.subscriptionCode || subscriptionCode || "",
        ),
        promoCode: normalizePromoCode(
          booking?.promotion?.code || promoCode || "",
        ),
        promotion: booking?.promotion || null,
        userRole: String(userRole || "guest"),
        createdAt: Date.now(),
      };

      try {
        window.sessionStorage.setItem(
          SUCCESS_BOOKING_STORAGE_KEY,
          JSON.stringify(payload),
        );
      } catch (_error) {
        // noop
      }
    },
    [safeSeats, seanceId, seanceInfo, totalPrice, userRole],
  );

  const restoreQuantitiesFromSelections = useCallback(
    (selections = []) => {
      if (!Array.isArray(selections) || !safePricingItems.length) {
        return {};
      }

      const next = {};
      selections.forEach((selection) => {
        if (!selection) {
          return;
        }

        const quantity = Number.parseInt(selection.quantity ?? 0, 10);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          return;
        }

        const match = safePricingItems.find((item) => {
          const itemId = item?.id ? String(item.id) : "";
          const selectionId = selection?.pricingId ? String(selection.pricingId) : "";

          if (itemId && selectionId && itemId === selectionId) {
            return true;
          }

          const itemName = String(item?.name || "").trim().toLowerCase();
          const selectionName = String(selection?.name || "").trim().toLowerCase();
          const itemPrice = toNumber(item?.price);
          const selectionPrice = toNumber(selection?.price);

          return (
            itemName &&
            selectionName &&
            itemName === selectionName &&
            itemPrice === selectionPrice
          );
        });

        if (!match) {
          return;
        }

        const key = String(match?.id ?? match?.name);
        next[key] = (next[key] || 0) + quantity;
      });

      return next;
    },
    [safePricingItems],
  );

  const finalizeBooking = useCallback(
    async ({
      selectionsOverride,
      customerContact,
      subscriptionCodeOverride,
      promoCodeOverride,
      silent = false,
    } = {}) => {
      if (
        isSubmitting ||
        !reservation?.reservationId ||
        !seanceId ||
        !safeSeats.length
      ) {
        return false;
      }

      const selections = Array.isArray(selectionsOverride)
        ? selectionsOverride.filter(Boolean)
        : buildPricingSelectionsFromQuantities();
      const resolvedSubscriptionCode =
        typeof subscriptionCodeOverride === "string"
          ? normalizeSubscriptionCode(subscriptionCodeOverride)
          : normalizedSubscriptionCode;
      const resolvedPromoCode =
        typeof promoCodeOverride === "string"
          ? normalizePromoCode(promoCodeOverride)
          : appliedPromoCode;

      if (totalSelectionCount(selections) !== assignableSeatsCount) {
        if (!silent) {
          setSubmitState({
            status: "error",
            message: "La repartition des tarifs est incomplete.",
            booking: null,
          });
        }
        return false;
      }

      setSubmitState({ status: "loading", message: "", booking: null });
      setErrorMessage("");
      setExpiredReservationMessage("");

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: seanceId,
            reservationId: reservation.reservationId,
            pricingSelections: selections,
            customerContact: customerContact || undefined,
            subscriptionCode: resolvedSubscriptionCode || undefined,
            promoCode: resolvedPromoCode || undefined,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            data?.message || "Erreur lors de la finalisation de la reservation.",
          );
        }

        clearCheckoutIntent();
        setIsAuthModalOpen(false);
        setAuthModalStep("choice");
        setGuestFormError("");
        const createdBooking = data?.booking || null;
        persistSuccessBooking({
          booking: createdBooking,
          selections,
          customerContact: customerContact || null,
          subscriptionCode: resolvedSubscriptionCode,
          promoCode: resolvedPromoCode,
        });
        setSubmitState({
          status: "success",
          message: "Reservation finalisee avec succes.",
          booking: createdBooking,
        });

        const bookingIdQuery =
          createdBooking?.id || createdBooking?._id
            ? `?bookingId=${encodeURIComponent(
                String(createdBooking?.id || createdBooking?._id),
              )}`
            : "";
        router.replace(`/reserver-siege/${seanceId}/checkout/succes${bookingIdQuery}`);
        return true;
      } catch (error) {
        const message =
          error?.message || "Erreur lors de la finalisation de la reservation.";
        setSubmitState({
          status: "error",
          message,
          booking: null,
        });
        if (!silent) {
          setErrorMessage("");
        }
        return false;
      }
    },
    [
      assignableSeatsCount,
      buildPricingSelectionsFromQuantities,
      clearCheckoutIntent,
      isSubmitting,
      normalizedSubscriptionCode,
      appliedPromoCode,
      persistSuccessBooking,
      reservation?.reservationId,
      router,
      safeSeats.length,
      seanceId,
      totalSelectionCount,
    ],
  );

  const handleOpenLogin = useCallback(
    (target) => {
      const selections = buildPricingSelectionsFromQuantities();
      persistCheckoutIntent(
        selections,
        normalizedSubscriptionCode,
        appliedPromoCode,
      );

      const redirectTarget = resolveRedirectPath(
        `/reserver-siege/${seanceId}/checkout?autofinalize=1`,
        "/profil",
      );
      const pathname = target === "signup" ? "/inscription" : "/connexion";
      router.push(
        `${pathname}?redirect=${encodeURIComponent(redirectTarget)}`,
      );
    },
    [
      buildPricingSelectionsFromQuantities,
      appliedPromoCode,
      normalizedSubscriptionCode,
      persistCheckoutIntent,
      router,
      seanceId,
    ],
  );

  const handleContinueAsGuest = useCallback(() => {
    setGuestFormError("");
    setAuthModalStep("guest");
  }, []);

  const handleGuestFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setGuestContact((current) => ({ ...current, [name]: value }));
    setGuestFormError("");
  }, []);

  const handleSubmitGuestContact = useCallback(
    async (event) => {
      event.preventDefault();

      const firstName = String(guestContact.firstName || "").trim();
      const lastName = String(guestContact.lastName || "").trim();
      const email = String(guestContact.email || "").trim().toLowerCase();

      if (!firstName || !lastName || !isValidEmail(email)) {
        setGuestFormError(
          "Veuillez renseigner un nom, un prenom et un email valide.",
        );
        return;
      }

      await finalizeBooking({
        customerContact: { firstName, lastName, email },
      });
    },
    [finalizeBooking, guestContact],
  );

  const handleSubscriptionCodeChange = useCallback((event) => {
    const rawValue = String(event?.target?.value || "");
    const safeValue = rawValue.toUpperCase().replace(/[^A-Z0-9-\s]/g, "");
    setSubscriptionCodeInput(safeValue);
    setErrorMessage("");
    if (submitState.status === "error") {
      setSubmitState({ status: "idle", message: "", booking: null });
    }
  }, [submitState.status]);

  const handlePromoCodeChange = useCallback(
    (event) => {
      const rawValue = String(event?.target?.value || "");
      const safeValue = rawValue.toUpperCase().replace(/[^A-Z0-9-\s]/g, "");
      setPromoCodeInput(safeValue);
      setErrorMessage("");
      if (promoState.status !== "idle") {
        setPromoState({ status: "idle", message: "", promo: null, pricing: null });
      }
    },
    [promoState.status],
  );

  const handleValidatePromo = useCallback(async () => {
    if (!canValidatePromo) {
      return;
    }

    setPromoState({ status: "loading", message: "", promo: null, pricing: null });
    setErrorMessage("");

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: normalizedPromoCode,
          subtotalAmount: totalPrice,
          customerContact:
            userRole === "guest" && guestContact?.email
              ? { email: String(guestContact.email).trim().toLowerCase() }
              : undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Code promo invalide.");
      }

      setPromoState({
        status: "applied",
        message: "Code promo applique.",
        promo: data?.promo || null,
        pricing: data?.pricing || null,
      });
      promoValidationContextRef.current = {
        subtotal: totalPrice,
        seatsCount: safeSeats.length,
      };
    } catch (error) {
      setPromoState({
        status: "error",
        message: error?.message || "Impossible de valider le code promo.",
        promo: null,
        pricing: null,
      });
    }
  }, [
    canValidatePromo,
    guestContact?.email,
    normalizedPromoCode,
    safeSeats.length,
    totalPrice,
    userRole,
  ]);

  const handleCancelPromo = useCallback(() => {
    setPromoCodeInput("");
    setPromoState({ status: "idle", message: "", promo: null, pricing: null });
    promoValidationContextRef.current = { subtotal: 0, seatsCount: 0 };
  }, []);

  useEffect(() => {
    if (promoState.status !== "applied") {
      return;
    }

    const context = promoValidationContextRef.current || {};
    const shouldClear =
      isSubscriptionPaymentRequested ||
      remainingToAssign !== 0 ||
      context.subtotal !== totalPrice ||
      context.seatsCount !== safeSeats.length;

    if (!shouldClear) {
      return;
    }

    setPromoState({
      status: "idle",
      message:
        isSubscriptionPaymentRequested
          ? "Le code promo n'est pas applicable avec un paiement abonnement."
          : "Le panier a change. Merci de revalider le code promo.",
      promo: null,
      pricing: null,
    });
  }, [
    isSubscriptionPaymentRequested,
    promoState.status,
    remainingToAssign,
    safeSeats.length,
    totalPrice,
  ]);

  const handleContinue = useCallback(async () => {
    if (!canContinue || isSubmitting) {
      return;
    }

    if (userRole === "guest") {
      setSubmitState({ status: "idle", message: "", booking: null });
      setGuestFormError("");
      setAuthModalStep("choice");
      setIsAuthModalOpen(true);
      return;
    }

    await finalizeBooking();
  }, [canContinue, finalizeBooking, isSubmitting, userRole]);

  useEffect(() => {
    if (userRole !== "customer") {
      return;
    }

    const shouldAutoFinalize = searchParams?.get("autofinalize") === "1";
    if (!shouldAutoFinalize || autoFinalizeAttemptedRef.current) {
      return;
    }

    if (!reservation?.reservationId || !safePricingItems.length) {
      return;
    }

    const intent = readCheckoutIntent();
    if (!intent || intent.seanceId !== seanceId) {
      autoFinalizeAttemptedRef.current = true;
      return;
    }

    const maxAgeMs = 30 * 60 * 1000;
    if (!intent.createdAt || Date.now() - Number(intent.createdAt) > maxAgeMs) {
      clearCheckoutIntent();
      autoFinalizeAttemptedRef.current = true;
      return;
    }

    if (
      intent.reservationId &&
      String(intent.reservationId) !== String(reservation.reservationId)
    ) {
      clearCheckoutIntent();
      autoFinalizeAttemptedRef.current = true;
      return;
    }

    const restoredQuantities = restoreQuantitiesFromSelections(intent.selections);
    setQuantities(restoredQuantities);
    if (typeof intent.subscriptionCode === "string") {
      setSubscriptionCodeInput(intent.subscriptionCode);
    }
    if (typeof intent.promoCode === "string") {
      setPromoCodeInput(intent.promoCode);
    }
    autoFinalizeAttemptedRef.current = true;

    finalizeBooking({
      selectionsOverride: Array.isArray(intent.selections)
        ? intent.selections
        : [],
      subscriptionCodeOverride: intent.subscriptionCode,
      promoCodeOverride: intent.promoCode,
      silent: true,
    });
  }, [
    clearCheckoutIntent,
    finalizeBooking,
    readCheckoutIntent,
    reservation?.reservationId,
    restoreQuantitiesFromSelections,
    safePricingItems.length,
    searchParams,
    seanceId,
    userRole,
  ]);

  if (isLoading) {
    return <CheckoutPageLoading />;
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-6 md:px-8">
      <div className="mb-6">
        <Link
          href={`/reservation-sieges/${seanceId}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-accent/70 hover:text-accent"
          aria-label="Retour a la selection des sieges"
        >
          <RiArrowLeftSLine className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <section className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Configuration de vos billets
            </h1>
            <p className="max-w-2xl text-sm text-white/60 md:text-base">
              Veuillez attribuer un tarif a chacune de vos places selectionnees
              pour finaliser votre reservation.
            </p>
          </div>

          <CheckoutStateAlerts
            isLoading={isLoading}
            errorMessage={errorMessage}
            reservation={reservation}
            expiredReservationMessage={expiredReservationMessage}
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex min-w-[240px] flex-1 items-center justify-between rounded-2xl border border-white/10 bg-[#161e22]/90 p-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                  Restantes a attribuer
                </p>
                <p className="text-4xl font-black tracking-tight text-accent">
                  {remainingToAssign}
                  <span className="ml-1 text-base font-medium text-white/30">
                    / {safeSeats.length} places
                  </span>
                </p>
              </div>
              <div className="rounded-full bg-accent/10 p-3 text-accent">
                <RiTicketLine className="h-7 w-7" />
              </div>
            </div>
          </div>

          <PricingQuantityList
            safePricingItems={safePricingItems}
            quantities={quantities}
            canAdjust={canAdjust}
            assignedCount={assignedCount}
            assignableSeatsCount={assignableSeatsCount}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            formatPrice={formatPrice}
          />

          <FixedPricingCard
            fixedPricingGroups={fixedPricingGroups}
            formatPrice={formatPrice}
          />

          <SubscriptionPaymentCard
            subscriptionCodeInput={subscriptionCodeInput}
            onSubscriptionCodeChange={handleSubscriptionCodeChange}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
            userRole={userRole}
            isSubscriptionPaymentRequested={isSubscriptionPaymentRequested}
            creditsToUseWithSubscription={creditsToUseWithSubscription}
          />

          <PromoCodeCard
            promoCodeInput={promoCodeInput}
            onPromoCodeChange={handlePromoCodeChange}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
            isSubscriptionPaymentRequested={isSubscriptionPaymentRequested}
            onValidatePromo={handleValidatePromo}
            onCancelPromo={handleCancelPromo}
            canValidatePromo={canValidatePromo}
            promoState={promoState}
            isPromoApplied={isPromoApplied}
            appliedPromoCode={appliedPromoCode}
            promoReductionLabel={promoReductionLabel}
            promoDiscountAmount={promoDiscountAmount}
            formatPrice={formatPrice}
          />

          <CheckoutTotalCard
            payableTotal={payableTotal}
            isSubscriptionPaymentRequested={isSubscriptionPaymentRequested}
            totalPrice={totalPrice}
            isPromoApplied={isPromoApplied}
            promoDiscountAmount={promoDiscountAmount}
            canContinue={canContinue}
            isSubmitting={isSubmitting}
            onContinue={handleContinue}
            submitState={submitState}
            formatPrice={formatPrice}
          />
        </section>

        <CheckoutSidebar
          seanceInfo={seanceInfo}
          seatLabels={seatLabels}
          safeSeatsCount={safeSeats.length}
          submitStatus={submitState.status}
          canContinue={canContinue}
          remainingToAssign={remainingToAssign}
          fallbackPoster={FALLBACK_POSTER}
        />
      </div>

      <CheckoutAuthModal
        isOpen={isAuthModalOpen}
        authModalStep={authModalStep}
        isSubmitting={isSubmitting}
        guestContact={guestContact}
        guestFormError={guestFormError}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalStep("choice");
          setGuestFormError("");
        }}
        onOpenLogin={handleOpenLogin}
        onContinueAsGuest={handleContinueAsGuest}
        onGuestFieldChange={handleGuestFieldChange}
        onGuestSubmit={handleSubmitGuestContact}
        onBackToChoice={() => {
          setAuthModalStep("choice");
          setGuestFormError("");
        }}
      />
    </main>
  );
}
