"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RiArrowRightLine,
  RiCalendarEventLine,
  RiCheckboxCircleFill,
  RiHome4Line,
  RiMailLine,
  RiPriceTag3Line,
  RiTicket2Line,
} from "react-icons/ri";

const FALLBACK_POSTER = "/images/logo.png";
const SUCCESS_BOOKING_STORAGE_KEY = "majestic_reserver_siege_success_booking";

const formatPrice = (value) => {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return "-";
  }
  return `${amount.toFixed(2).replace(".", ",")} DT`;
};

const formatDateTime = (dateValue, timeValue) => {
  if (!dateValue) {
    return timeValue || "-";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    const dateText = String(dateValue).trim();
    if (!dateText) {
      return timeValue || "-";
    }
    return `${dateText}${timeValue ? ` • ${timeValue}` : ""}`;
  }

  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);

  return `${dateLabel}${timeValue ? ` • ${timeValue}` : ""}`;
};

const formatSeatLabel = (seat) => {
  if (!seat || seat.row === undefined || seat.col === undefined) {
    return "";
  }
  return `${seat.row}${seat.col}`;
};

const normalizePayload = ({ payload, seanceId, bookingId }) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const payloadSeanceId = String(payload.seanceId || "");
  if (payloadSeanceId && seanceId && payloadSeanceId !== String(seanceId)) {
    return null;
  }

  const payloadBookingId = String(
    payload?.booking?.id || payload?.booking?._id || "",
  );
  if (bookingId && payloadBookingId && payloadBookingId !== String(bookingId)) {
    return null;
  }

  return payload;
};

export default function PurchaseSuccessClient({ seanceId, bookingId }) {
  const [customerEmail, setCustomerEmail] = useState("");
  const payload = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = window.sessionStorage.getItem(SUCCESS_BOOKING_STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return normalizePayload({
        payload: parsed,
        seanceId,
        bookingId,
      });
    } catch (_error) {
      return null;
    }
  }, [bookingId, seanceId]);

  useEffect(() => {
    let active = true;

    const loadEmail = async () => {
      if (payload?.customerContact?.email) {
        return;
      }

      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (!active) {
          return;
        }
        const email = data?.user?.email ? String(data.user.email) : "";
        setCustomerEmail(email);
      } catch (_error) {
        // noop
      }
    };

    loadEmail();

    return () => {
      active = false;
    };
  }, [payload?.customerContact?.email]);

  const seanceInfo = payload?.seanceInfo || {};
  const booking = payload?.booking || {};
  const seats = Array.isArray(payload?.seats) ? payload.seats : [];
  const seatLabels = seats.map(formatSeatLabel).filter(Boolean);
  const displayTotal = formatPrice(
    booking?.totalAmount ?? payload?.totalAmount ?? null,
  );
  const displayDate = formatDateTime(seanceInfo?.date || null, seanceInfo?.time || "");
  const displayBookingCode = booking?.bookingNumber || bookingId || "-";
  const displayPoster = seanceInfo?.poster || FALLBACK_POSTER;
  const canOpenTickets = String(payload?.userRole || "") === "customer";
  const ticketsHref = canOpenTickets
    ? "/profil/billets"
    : seanceInfo?.eventId
      ? `/evenements/${seanceInfo.eventId}`
      : "/";
  const ticketsLabel = canOpenTickets ? "Consulter mes billets" : "Voir l'evenement";

  const displayEmail = useMemo(() => {
    if (payload?.customerContact?.email) {
      return String(payload.customerContact.email);
    }
    return customerEmail || "-";
  }, [customerEmail, payload?.customerContact?.email]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black px-4 py-10 text-white md:px-10 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <section className="mb-10 flex flex-col items-center text-center">
          <span className="relative inline-flex items-center justify-center">
            <span className="absolute h-20 w-20 rounded-full bg-primary/30 blur-2xl" />
            <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/20 text-primary">
              <RiCheckboxCircleFill className="h-10 w-10" />
            </span>
          </span>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white md:text-5xl">
            Achat confirme
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60 md:text-base">
            Votre reservation est enregistree. Retrouvez ci-dessous les details
            de votre seance et votre code booking.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#131b22]/80 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              Resume de reservation
            </p>

            <div className="mt-5 flex gap-4">
              <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src={displayPoster}
                  alt={seanceInfo?.title || "Affiche evenement"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-xl font-bold text-white">
                  {seanceInfo?.title || "Seance"}
                </h2>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <p className="flex items-center gap-2">
                    <RiCalendarEventLine className="h-4 w-4 text-accent" />
                    <span>{displayDate}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <RiTicket2Line className="h-4 w-4 text-accent" />
                    <span>
                      {seatLabels.length
                        ? `Sieges: ${seatLabels.join(", ")}`
                        : "Sieges non disponibles"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <RiPriceTag3Line className="h-4 w-4 text-accent" />
                    <span>Total: {displayTotal}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                Code booking
              </p>
              <p className="mt-2 break-all text-xl font-black text-white md:text-2xl">
                {displayBookingCode}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={ticketsHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:brightness-110"
              >
                {ticketsLabel}
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/85 transition hover:border-accent hover:text-accent"
              >
                <RiHome4Line className="h-4 w-4" />
                Retour accueil
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-accent/30 bg-accent/5 p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <RiMailLine className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold text-white">Confirmation envoyee</p>
                <p className="text-sm text-white/60">{displayEmail}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-400/60" />
                <span className="h-2 w-2 rounded-full bg-amber-300/60" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-2/3 rounded-full bg-white/10" />
                <div className="h-4 w-4/5 rounded-full bg-white/15" />
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/10">
                  <RiTicket2Line className="h-9 w-9 text-white/60" />
                </div>
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="h-2 w-5/6 rounded-full bg-white/10" />
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Un email de confirmation contenant votre recapitulatif booking a
              ete envoye. Conservez le code booking pour toute assistance.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
