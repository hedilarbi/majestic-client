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
  toNumber
} from
  "./checkout-utils";

const normalizePricingLookupToken = (value) =>
  String(value || "").trim().toLowerCase();

const buildPricingLookupKey = (name, price) => {
  const normalizedName = normalizePricingLookupToken(name);
  const normalizedPrice = toNumber(price);

  if (!normalizedName || !Number.isFinite(normalizedPrice)) {
    return "";
  }

  return `${normalizedName}|${normalizedPrice}`;
};

const resolvePricingItemKey = (item, index) =>
  String(item?.id ?? item?.name ?? index);

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
    eventId: ""
  });
  const [pricingItems, setPricingItems] = useState([]);
  const [pricingOverrides, setPricingOverrides] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [expiredReservationMessage, setExpiredReservationMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("guest");
  const [userEmailVerified, setUserEmailVerified] = useState(null);
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
    booking: null
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState("choice");
  const [guestContact, setGuestContact] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [guestFormError, setGuestFormError] = useState("");
  const [subscriptionCodeInput, setSubscriptionCodeInput] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoState, setPromoState] = useState({
    status: "idle",
    message: "",
    promo: null,
    pricing: null
  });
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState("");
  const reservationRef = useRef(null);
  const reservationSeatKeysRef = useRef(new Set());
  const autoFinalizeAttemptedRef = useRef(false);
  const promoValidationContextRef = useRef({ subtotal: 0, seatsCount: 0 });
  const hasRedirectedForMissingReservationRef = useRef(false);
  const verificationRedirectPath = useMemo(
    () =>
      resolveRedirectPath(
        `/reservations/${seanceId}/checkout?autofinalize=1`,
        "/profil",
      ),
    [seanceId],
  );

  const redirectToVerifyEmail = useCallback(
    (replace = false) => {
      const target = `/verify-email?redirect=${encodeURIComponent(
        verificationRedirectPath,
      )}&send=1&info=${encodeURIComponent(
        "Un nouveau code OTP vous sera envoyé pour finaliser votre achat.",
      )}`;

      if (replace) {
        router.replace(target);
        return;
      }

      router.push(target);
    },
    [router, verificationRedirectPath],
  );

  const applyCheckoutData = useCallback(
    (data, { markExpiredWhenMissing = false, hadReservationBefore = false } = {}) => {
      const normalized = normalizeReservationResponse({
        reservation: data?.reservation
      });
      const normalizedSeats = Array.isArray(normalized.seats) ? normalized.seats : [];
      const hasReservation = Boolean(
        normalized.reservationId && normalizedSeats.length > 0
      );

      if (hasReservation) {
        setReservation({
          reservationId: normalized.reservationId,
          expiresAt: normalized.expiresAt,
          seats: normalizedSeats
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
    []
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
          signal
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Impossible de charger la réservation.");
        }

        const hadReservationBefore = Boolean(
          reservationRef.current?.reservationId &&
          (reservationRef.current?.seats?.length || 0) > 0
        );

        setErrorMessage("");
        applyCheckoutData(data, {
          markExpiredWhenMissing,
          hadReservationBefore
        });
        return true;
      } catch (error) {
        if (error?.name === "AbortError") {
          return false;
        }
        if (!suppressErrors) {
          setErrorMessage(
            error?.message || "Impossible de charger la réservation."
          );
        }
        return false;
      }
    },
    [applyCheckoutData, seanceId]
  );

  const markReservationExpired = useCallback(() => {
    const hasReservation = Boolean(
      reservationRef.current?.reservationId &&
      (reservationRef.current?.seats?.length || 0) > 0
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
    const currentSeats = Array.isArray(seats) ?
      seats.filter((seat) => seat && seat.row !== undefined && seat.col !== undefined) :
      [];

    reservationSeatKeysRef.current = new Set(
      currentSeats.map((seat) => seatKey(seat.row, seat.col))
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
        setUserEmailVerified(
          typeof data?.user?.emailVerified === "boolean"
            ? data.user.emailVerified
            : null,
        );
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
    if (userId && userRole === "customer") {
      const loadSubscriptions = async () => {
        try {
          const response = await fetch("/api/subscription-sales/me", { cache: "no-store" });
          if (!response.ok) return;
          const data = await response.json();
          if (active) {
            setMySubscriptions(Array.isArray(data?.items) ? data.items : []);
          }
        } catch (e) {
          console.error("Failed to load subscriptions", e);
        }
      };
      loadSubscriptions();
    } else {
      setMySubscriptions([]);
    }
    return () => { active = false; };
  }, [userId, userRole]);

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
      reservation?.reservationId && (reservation?.seats?.length || 0) > 0
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
    reservation?.seats?.length]
  );

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
          suppressErrors: true
        });
        return;
      }

      timeoutId = window.setTimeout(
        scheduleExpiryCheck,
        Math.min(remainingMs, 1000)
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

    const socket = io(resolvedSocketUrl, {
      transports: ["polling", "websocket"],
      reconnection: true,
      timeout: 10000
    });
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
        payloadUserId && userId && payloadUserId === String(userId)
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
          suppressErrors: true
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
        payloadUserId && userId && payloadUserId === String(userId)
      );
      const payloadReservationId = payload?.reservationId ?
        String(payload.reservationId) :
        "";
      const currentReservationId = reservationRef.current?.reservationId ?
        String(reservationRef.current.reservationId) :
        "";
      const sameReservation = Boolean(
        payloadReservationId &&
        currentReservationId &&
        payloadReservationId === currentReservationId
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
    userId]
  );

  const safeSeats = useMemo(
    () =>
      Array.isArray(seats) ?
        seats.filter((seat) => seat && seat.row !== undefined && seat.col !== undefined) :
        [],
    [seats]
  );

  const availablePricingItems = useMemo(
    () =>
      Array.isArray(pricingItems) ?
        pricingItems.filter((item) => item && item.name && item.isAvailable !== false) :
        [],
    [pricingItems]
  );

  const overrideMap = useMemo(
    () => buildOverrideMap(pricingOverrides, seatKey),
    [pricingOverrides]
  );

  const fixedSeats = useMemo(
    () =>
      safeSeats.filter((seat) => Boolean(resolveSeatOverride(seat, overrideMap, seatKey))),
    [overrideMap, safeSeats]
  );

  const assignableSeatsCount = Math.max(safeSeats.length - fixedSeats.length, 0);

  const fixedPricingUsage = useMemo(() => {
    const byId = new Map();
    const byKey = new Map();

    fixedSeats.forEach((seat) => {
      const override = resolveSeatOverride(seat, overrideMap, seatKey);
      if (!override) {
        return;
      }

      const id = override?.id ? String(override.id) : "";
      const lookupKey = buildPricingLookupKey(override?.name, override?.price);

      if (id) {
        byId.set(id, (byId.get(id) || 0) + 1);
      }
      if (lookupKey) {
        byKey.set(lookupKey, (byKey.get(lookupKey) || 0) + 1);
      }
    });

    return { byId, byKey };
  }, [fixedSeats, overrideMap]);

  const safePricingItems = useMemo(
    () =>
      availablePricingItems.
        map((item) => {
          const id = item?.id ? String(item.id) : "";
          const lookupKey = buildPricingLookupKey(item?.name, item?.price);
          const parsedRemaining = Number.parseInt(item?.remainingTickets, 10);
          const hasRemainingLimit = Number.isFinite(parsedRemaining);
          const remainingTickets = hasRemainingLimit ?
            Math.max(parsedRemaining, 0) :
            null;

          let variableRemainingTickets = remainingTickets;
          if (hasRemainingLimit) {
            const fixedSeatsCount =
              (id && fixedPricingUsage.byId.has(id) ?
                fixedPricingUsage.byId.get(id) :
                lookupKey ?
                  fixedPricingUsage.byKey.get(lookupKey) || 0 :
                  0) || 0;
            variableRemainingTickets = Math.max(
              remainingTickets - fixedSeatsCount,
              0
            );
          }

          if (
            variableRemainingTickets !== null &&
            variableRemainingTickets <= 0) {
            return null;
          }

          return {
            ...item,
            variableRemainingTickets
          };
        }).
        filter(Boolean),
    [availablePricingItems, fixedPricingUsage]
  );

  const pricingItemByKey = useMemo(() => {
    const map = new Map();

    safePricingItems.forEach((item, index) => {
      map.set(resolvePricingItemKey(item, index), item);
    });

    return map;
  }, [safePricingItems]);

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
        seats: []
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
        0
      ),
    [fixedPricingGroups]
  );

  const assignedCount = useMemo(
    () =>
      safePricingItems.reduce((sum, item, index) => {
        const itemKey = resolvePricingItemKey(item, index);
        return sum + (Number.isFinite(quantities[itemKey]) ? quantities[itemKey] : 0);
      }, 0),
    [quantities, safePricingItems]
  );

  const remainingToAssign = Math.max(assignableSeatsCount - assignedCount, 0);

  useEffect(() => {
    setQuantities((prev) => {
      const previous = prev && typeof prev === "object" ? prev : {};
      const next = {};

      safePricingItems.forEach((item, index) => {
        const itemKey = resolvePricingItemKey(item, index);
        const rawValue = Number.parseInt(previous[itemKey] ?? 0, 10);
        if (!Number.isFinite(rawValue) || rawValue <= 0) {
          return;
        }

        const maxForItem = Number.isFinite(item?.variableRemainingTickets) ?
          Math.max(item.variableRemainingTickets, 0) :
          null;
        const safeValue =
          maxForItem === null ? rawValue : Math.min(rawValue, maxForItem);

        if (safeValue > 0) {
          next[itemKey] = safeValue;
        }
      });

      let assignableLeft = Math.max(assignableSeatsCount, 0);
      const capped = {};

      safePricingItems.forEach((item, index) => {
        const itemKey = resolvePricingItemKey(item, index);
        const value = Number.parseInt(next[itemKey] ?? 0, 10);
        if (!Number.isFinite(value) || value <= 0 || assignableLeft <= 0) {
          return;
        }

        const safeValue = Math.min(value, assignableLeft);
        if (safeValue > 0) {
          capped[itemKey] = safeValue;
          assignableLeft -= safeValue;
        }
      });

      const previousKeys = Object.keys(previous);
      const nextKeys = Object.keys(capped);

      if (previousKeys.length !== nextKeys.length) {
        return capped;
      }

      for (const key of previousKeys) {
        if ((previous[key] || 0) !== (capped[key] || 0)) {
          return capped;
        }
      }

      return previous;
    });
  }, [assignableSeatsCount, safePricingItems]);

  const variableTotal = useMemo(
    () =>
      safePricingItems.reduce((sum, item, index) => {
        const itemKey = resolvePricingItemKey(item, index);
        const quantity = quantities[itemKey] || 0;
        return sum + quantity * toNumber(item?.price);
      }, 0),
    [quantities, safePricingItems]
  );

  const totalPrice = fixedTotal + variableTotal;
  const normalizedSubscriptionCode = useMemo(
    () => normalizeSubscriptionCode(subscriptionCodeInput),
    [subscriptionCodeInput]
  );
  const normalizedPromoCode = useMemo(
    () => normalizePromoCode(promoCodeInput),
    [promoCodeInput]
  );
  const isSubscriptionPaymentRequested =
    (userRole === "customer" && Boolean(normalizedSubscriptionCode)) || Boolean(selectedSubId);
  const isPromoApplied =
    promoState.status === "applied" && Boolean(promoState?.promo?.code);
  const appliedPromoCode = isPromoApplied ? String(promoState.promo.code) : "";
  const promoDiscountAmount = isPromoApplied ?
    toNumber(promoState?.pricing?.discountAmount) :
    0;
  const promoReductionLabel = isPromoApplied ?
    promoState?.promo?.reductionType === "percent" ?
      `${toNumber(promoState?.promo?.reductionValue)}%` :
      formatPrice(promoState?.promo?.reductionValue) :
    "";
  const creditsToUseWithSubscription = safeSeats.length;

  const selectedSub = useMemo(() => {
    if (!selectedSubId) return null;
    return mySubscriptions.find(s => String(s.id || s._id) === String(selectedSubId));
  }, [selectedSubId, mySubscriptions]);

  // Client-side subscription validation — runs instantly on selection
  const subscriptionValidationError = useMemo(() => {
    if (!selectedSub || !safeSeats.length) return null;

    const allowedSeatType = selectedSub.allowedSeatType || "normale";
    const maxSeatsPerSession = Number.isFinite(Number(selectedSub.maxSeatsPerSession))
      ? Number(selectedSub.maxSeatsPerSession)
      : 1;
    const remainingCredits = Number.isFinite(Number(selectedSub.remainingCredits))
      ? Number(selectedSub.remainingCredits)
      : 0;
    const totalSeats = safeSeats.length;
    const hasFixedSeats = fixedSeats.length > 0;
    const hasVariableSeats = assignableSeatsCount > 0;

    // 1. Check remaining credits
    if (remainingCredits < totalSeats) {
      return `Crédits insuffisants : il vous reste ${remainingCredits} crédit${remainingCredits > 1 ? "s" : ""} mais vous avez sélectionné ${totalSeats} siège${totalSeats > 1 ? "s" : ""}.`;
    }

    // 2. Check max seats per session
    if (totalSeats > maxSeatsPerSession) {
      return `Cet abonnement est limité à ${maxSeatsPerSession} siège${maxSeatsPerSession > 1 ? "s" : ""} par séance. Vous avez sélectionné ${totalSeats} siège${totalSeats > 1 ? "s" : ""}.`;
    }

    // 3. Seat type: VIP sub can book everything, normal sub cannot book VIP seats
    if (allowedSeatType === "normale" && hasFixedSeats) {
      return "Cet abonnement ne permet pas de réserver des sièges VIP ou à tarif fixe.";
    }

    return null;
  }, [selectedSub, safeSeats.length, fixedSeats.length, assignableSeatsCount]);

  const payableTotal = (isSubscriptionPaymentRequested || selectedSub) ?
    0 :
    Math.max(totalPrice - promoDiscountAmount, 0);
  const isSubmitting = submitState.status === "loading";
  const isSuccess = submitState.status === "success";
  const requiresEmailVerification =
    userRole === "customer" && userEmailVerified === false;
  const canValidatePromo =
    !isSubmitting &&
    !isSuccess &&
    !isSubscriptionPaymentRequested &&
    !selectedSub &&
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
    (selectedSubId ? !subscriptionValidationError : remainingToAssign === 0) &&
    !isSubmitting &&
    !isSuccess;

  const seatLabels = useMemo(
    () => safeSeats.map(formatSeatLabel).filter(Boolean),
    [safeSeats]
  );

  const handleIncrement = useCallback(
    (itemKey) => {
      if (!canAdjust || isSubmitting || isSuccess) {
        return;
      }

      setQuantities((prev) => {
        const targetPricing = pricingItemByKey.get(itemKey);
        if (!targetPricing) {
          return prev;
        }

        const currentAssigned = Object.values(prev).reduce(
          (sum, value) => sum + (Number.isFinite(value) ? value : 0),
          0
        );
        if (currentAssigned >= assignableSeatsCount) {
          return prev;
        }

        const currentValue = prev[itemKey] || 0;
        const maxForItem = Number.isFinite(targetPricing?.variableRemainingTickets) ?
          Math.max(targetPricing.variableRemainingTickets, 0) :
          null;
        if (maxForItem !== null && currentValue >= maxForItem) {
          return prev;
        }

        const nextValue = currentValue + 1;
        return { ...prev, [itemKey]: nextValue };
      });
    },
    [assignableSeatsCount, canAdjust, isSubmitting, isSuccess, pricingItemByKey]
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
    [canAdjust, isSubmitting, isSuccess]
  );

  const buildPricingSelectionsFromQuantities = useCallback(
    (sourceQuantities = quantities) =>
      safePricingItems.
        map((item, index) => {
          const itemKey = resolvePricingItemKey(item, index);
          const quantity = sourceQuantities[itemKey] || 0;
          if (!quantity) {
            return null;
          }

          return {
            pricingId: item?.id ?? null,
            name: item?.name || "",
            price: item?.price,
            quantity
          };
        }).
        filter(Boolean),
    [quantities, safePricingItems]
  );

  const totalSelectionCount = useCallback(
    (selections = []) =>
      (Array.isArray(selections) ? selections : []).reduce((sum, selection) => {
        const quantity = Number.parseInt(selection?.quantity ?? 0, 10);
        return sum + (Number.isFinite(quantity) ? quantity : 0);
      }, 0),
    []
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
        createdAt: Date.now()
      };

      try {
        window.sessionStorage.setItem(
          CHECKOUT_INTENT_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch (_error) {

        // noop
      }
    },
    [reservation?.reservationId, seanceId]
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
        seats: safeSeats.
          filter((seat) => seat && seat.row !== undefined && seat.col !== undefined).
          map((seat) => ({
            row: String(seat.row),
            col: Number(seat.col)
          })),
        pricingSelections: Array.isArray(selections) ? selections : [],
        totalAmount: Number.isFinite(toNumber(booking?.totalAmount)) ?
          toNumber(booking?.totalAmount) :
          totalPrice,
        customerContact: customerContact || null,
        subscriptionCode: normalizeSubscriptionCode(
          booking?.subscriptionTransaction?.subscriptionCode || subscriptionCode || ""
        ),
        promoCode: normalizePromoCode(
          booking?.promotion?.code || promoCode || ""
        ),
        promotion: booking?.promotion || null,
        userRole: String(userRole || "guest"),
        createdAt: Date.now()
      };

      try {
        window.sessionStorage.setItem(
          SUCCESS_BOOKING_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch (_error) {

        // noop
      }
    },
    [safeSeats, seanceId, seanceInfo, totalPrice, userRole]
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

        let matchedIndex = -1;
        const match = safePricingItems.find((item, index) => {
          const itemId = item?.id ? String(item.id) : "";
          const selectionId = selection?.pricingId ? String(selection.pricingId) : "";

          if (itemId && selectionId && itemId === selectionId) {
            matchedIndex = index;
            return true;
          }

          const itemName = String(item?.name || "").trim().toLowerCase();
          const selectionName = String(selection?.name || "").trim().toLowerCase();
          const itemPrice = toNumber(item?.price);
          const selectionPrice = toNumber(selection?.price);

          const matched =
            itemName &&
            selectionName &&
            itemName === selectionName &&
            itemPrice === selectionPrice;

          if (matched) {
            matchedIndex = index;
          }

          return matched;
        });

        if (!match) {
          return;
        }

        const key = resolvePricingItemKey(match, matchedIndex);
        next[key] = (next[key] || 0) + quantity;
      });

      return next;
    },
    [safePricingItems]
  );

  const finalizeBooking = useCallback(
    async ({
      selectionsOverride,
      customerContact,
      subscriptionCodeOverride,
      promoCodeOverride,
      silent = false
    } = {}) => {
      if (
        isSubmitting ||
        !reservation?.reservationId ||
        !seanceId ||
        !safeSeats.length) {
        return false;
      }

      const selections = Array.isArray(selectionsOverride) ?
        selectionsOverride.filter(Boolean) :
        buildPricingSelectionsFromQuantities();
      const resolvedSubscriptionCode =
        typeof subscriptionCodeOverride === "string" ?
          normalizeSubscriptionCode(subscriptionCodeOverride) :
          normalizedSubscriptionCode;
      const resolvedPromoCode =
        typeof promoCodeOverride === "string" ?
          normalizePromoCode(promoCodeOverride) :
          appliedPromoCode;

      if (!selectedSub && totalSelectionCount(selections) !== assignableSeatsCount) {
        if (!silent) {
          setSubmitState({
            status: "error",
            message: "La repartition des tarifs est incomplete.",
            booking: null
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
            pricingSelections: selectedSub ? [{
              name: "Abonnement",
              price: 0,
              quantity: assignableSeatsCount
            }] : selections,
            customerContact: customerContact || undefined,
            subscriptionCode: selectedSub ? selectedSub.subscriptionCode : (resolvedSubscriptionCode || undefined),
            promoCode: resolvedPromoCode || undefined
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message =
            data?.message ||
            "Erreur lors de la finalisation de la réservation.";
          if (
            response.status === 403 &&
            typeof message === "string" &&
            message.toLowerCase().includes("vérifier votre adresse email")
          ) {
            setSubmitState({ status: "idle", message: "", booking: null });
            redirectToVerifyEmail();
            return false;
          }

          throw new Error(
            message
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
          promoCode: resolvedPromoCode
        });

        if (data?.paymentFormUrl) {
          window.location.href = data.paymentFormUrl;
          return true;
        }
        setSubmitState({
          status: "success",
          message: "Réservation finalisee avec succès.",
          booking: createdBooking
        });

        const bookingIdQuery =
          createdBooking?.id || createdBooking?._id ?
            `?bookingId=${encodeURIComponent(
              String(createdBooking?.id || createdBooking?._id)
            )}` :
            "";
        router.replace(`/reservations/${seanceId}/checkout/succes${bookingIdQuery}`);
        return true;
      } catch (error) {
        const message =
          error?.message || "Erreur lors de la finalisation de la réservation.";
        setSubmitState({
          status: "error",
          message,
          booking: null
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
      redirectToVerifyEmail,
      router,
      safeSeats.length,
      seanceId,
      totalSelectionCount]

  );

  const handleOpenLogin = useCallback(
    (target) => {
      const selections = buildPricingSelectionsFromQuantities();
      persistCheckoutIntent(
        selections,
        normalizedSubscriptionCode,
        appliedPromoCode
      );

      const redirectTarget = resolveRedirectPath(
        `/reservations/${seanceId}/checkout?autofinalize=1`,
        "/profil"
      );
      const pathname = target === "signup" ? "/inscription" : "/connexion";
      router.push(
        `${pathname}?redirect=${encodeURIComponent(redirectTarget)}`
      );
    },
    [
      buildPricingSelectionsFromQuantities,
      appliedPromoCode,
      normalizedSubscriptionCode,
      persistCheckoutIntent,
      router,
      seanceId]

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
          "Veuillez renseigner un nom, un prénom et un email valide."
        );
        return;
      }

      await finalizeBooking({
        customerContact: { firstName, lastName, email }
      });
    },
    [finalizeBooking, guestContact]
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
    [promoState.status]
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
            userRole === "guest" && guestContact?.email ?
              { email: String(guestContact.email).trim().toLowerCase() } :
              undefined
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Code promo invalide.");
      }

      setPromoState({
        status: "applied",
        message: "Code promo applique.",
        promo: data?.promo || null,
        pricing: data?.pricing || null
      });
      promoValidationContextRef.current = {
        subtotal: totalPrice,
        seatsCount: safeSeats.length
      };
    } catch (error) {
      setPromoState({
        status: "error",
        message: error?.message || "Impossible de valider le code promo.",
        promo: null,
        pricing: null
      });
    }
  }, [
    canValidatePromo,
    guestContact?.email,
    normalizedPromoCode,
    safeSeats.length,
    totalPrice,
    userRole]
  );

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
        isSubscriptionPaymentRequested ?
          "Le code promo n'est pas applicable avec un paiement abonnement." :
          "Le panier a change. Merci de revalider le code promo.",
      promo: null,
      pricing: null
    });
  }, [
    isSubscriptionPaymentRequested,
    promoState.status,
    remainingToAssign,
    safeSeats.length,
    totalPrice]
  );

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

    if (requiresEmailVerification) {
      redirectToVerifyEmail();
      return;
    }

    await finalizeBooking();
  }, [
    canContinue,
    finalizeBooking,
    isSubmitting,
    redirectToVerifyEmail,
    requiresEmailVerification,
    userRole,
  ]);

  useEffect(() => {
    if (userRole !== "customer") {
      return;
    }

    if (userEmailVerified === false) {
      if (!autoFinalizeAttemptedRef.current) {
        autoFinalizeAttemptedRef.current = true;
      }
      redirectToVerifyEmail(true);
      return;
    }

    if (userEmailVerified !== true) {
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
      String(intent.reservationId) !== String(reservation.reservationId)) {
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
    const restoredSelections =
      buildPricingSelectionsFromQuantities(restoredQuantities);

    finalizeBooking({
      selectionsOverride: restoredSelections,
      subscriptionCodeOverride: intent.subscriptionCode,
      promoCodeOverride: intent.promoCode,
      silent: true
    });
  }, [
    buildPricingSelectionsFromQuantities,
    clearCheckoutIntent,
    finalizeBooking,
    readCheckoutIntent,
    reservation?.reservationId,
    redirectToVerifyEmail,
    restoreQuantitiesFromSelections,
    safePricingItems.length,
    searchParams,
    seanceId,
    userEmailVerified,
    userRole]
  );

  if (isLoading) {
    return <CheckoutPageLoading />;
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-6 md:px-8">
      <div className="mb-6">
        <Link
          href={`/reservations/${seanceId}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-accent text-black/80 transition hover:border-accent/70 hover:text-accent"
          aria-label="Retour a la selection des sièges">

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
              Veuillez attribuer un tarif à chacune de vos places sélectionnées
              pour finaliser votre réservation.
            </p>
          </div>

          <CheckoutStateAlerts
            isLoading={isLoading}
            errorMessage={errorMessage}
            reservation={reservation}
            expiredReservationMessage={expiredReservationMessage} />

          {requiresEmailVerification ? (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
              Votre compte n&apos;est pas encore vérifié. Vérifiez votre adresse
              email pour finaliser cet achat.
            </div>
          ) : null}


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

          {mySubscriptions.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <RiTicketLine className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-bold text-white">Utiliser un abonnement</h3>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subscription-select" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Abonnements disponibles
                </label>
                <select
                  id="subscription-select"
                  value={selectedSubId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSubId(val);
                    if (val) setQuantities({});
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white transition focus:border-accent/50 focus:bg-white/10 focus:outline-none"
                >
                  <option value="">Aucun abonnement (Paiement classique)</option>
                  {mySubscriptions.map(sub => (
                    <option key={sub.id || sub._id} value={sub.id || sub._id} className="bg-[#161e22]">
                      {sub.subscriptionCode} — {sub.remainingCredits} crédits ({sub.allowedSeatType === 'normale' ? 'Sièges Standards' : 'Sièges VIP'})
                    </option>
                  ))}
                </select>
              </div>
              {selectedSub && (
                subscriptionValidationError ? (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                    <p>{subscriptionValidationError}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
                    <p>✓ Abonnement valide — {safeSeats.length} crédit{safeSeats.length > 1 ? "s" : ""} seront débités. Aucun tarif à choisir.</p>
                  </div>
                )
              )}
            </div>
          )}

          {!selectedSub && (
            <PricingQuantityList
              safePricingItems={safePricingItems}
              quantities={quantities}
              canAdjust={canAdjust}
              assignedCount={assignedCount}
              assignableSeatsCount={assignableSeatsCount}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              formatPrice={formatPrice} />
          )}

          <FixedPricingCard
            fixedPricingGroups={fixedPricingGroups}
            formatPrice={formatPrice} />

          {/* 
          <SubscriptionPaymentCard
            subscriptionCodeInput={subscriptionCodeInput}
            onSubscriptionCodeChange={handleSubscriptionCodeChange}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
            userRole={userRole}
            isSubscriptionPaymentRequested={isSubscriptionPaymentRequested}
            creditsToUseWithSubscription={creditsToUseWithSubscription} /> */}


          {!selectedSub && (
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
              userRole={userRole} />
          )}


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
            formatPrice={formatPrice} />

        </section>

        <CheckoutSidebar
          seanceInfo={seanceInfo}
          seatLabels={seatLabels}
          safeSeatsCount={safeSeats.length}
          submitStatus={submitState.status}
          canContinue={canContinue}
          remainingToAssign={remainingToAssign}
          fallbackPoster={FALLBACK_POSTER} />

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
        }} />

    </main>);

}
