"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdCalendarMonth } from "react-icons/md";

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const formatMonthLabel = (date) => {
  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "long" });
  const label = formatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const buildCalendarDays = (baseDate, selectedKey, todayKey) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let i = 0; i < offset; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    days.push({
      day,
      key,
      isSelected: key === selectedKey,
      isDisabled: todayKey ? key < todayKey : false,
    });
  }

  return days;
};

export default function CinemaCalendarButton({ selectedDate, todayKey }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeDate =
    parseDateKey(selectedDate) || parseDateKey(todayKey) || new Date();
  const selectedKey = selectedDate || toDateKey(activeDate);
  const monthLabel = formatMonthLabel(activeDate);

  const calendarDays = useMemo(
    () => buildCalendarDays(activeDate, selectedKey, todayKey),
    [activeDate, selectedKey, todayKey]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const handleSelect = (dateKey) => {
    router.push(`/cinema?date=${dateKey}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MdCalendarMonth className="h-10 w-10 text-white/60" />
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 text-center text-lg font-semibold text-white font-display">
            {monthLabel}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-white/40 font-display">
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} />;
              }
              return (
                <button
                  key={day.key}
                  type="button"
                  disabled={day.isDisabled}
                  onClick={() => handleSelect(day.key)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                    day.isSelected
                      ? "bg-accent text-black"
                      : "text-white/70 hover:bg-white/10"
                  } ${day.isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {day.day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
