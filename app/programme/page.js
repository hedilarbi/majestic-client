import {
  getAvailableProgrammeDates,
  getSessionsByDate,
} from "../lib/cinema-api";
import ProgrammePageClient from "./ProgrammePageClient";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
});
const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", { month: "short" });

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateParam = (value) => {
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

const formatWeekday = (date) =>
  WEEKDAY_FORMATTER.format(date).replace(".", "").toUpperCase();

const formatMonth = (date) =>
  MONTH_FORMATTER.format(date).replace(".", "").toUpperCase();

const buildDateOptions = (availableDateKeys, selectedKey, todayKey) => {
  const tomorrow = parseDateParam(todayKey);
  if (tomorrow) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  const tomorrowKey = tomorrow ? formatDateKey(tomorrow) : "";

  return availableDateKeys.map((value) => {
    const date = parseDateParam(value);

    return {
      value,
      label:
        value === todayKey
          ? "AUJ"
          : value === tomorrowKey
            ? "DEM"
            : date
              ? formatWeekday(date)
              : "",
      day: date ? String(date.getDate()) : "",
      month: date ? formatMonth(date) : "",
      isActive: value === selectedKey,
    };
  });
};

export default async function CinemaPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const today = new Date();
  const todayKey = formatDateKey(today);
  const availableDateKeys = await getAvailableProgrammeDates(todayKey);
  const requestedDate = parseDateParam(resolvedParams?.date);
  const selectedDateKey = requestedDate
    ? formatDateKey(requestedDate)
    : todayKey;
  const requestedDateHasSessions = availableDateKeys.includes(selectedDateKey);
  const activeDateKey =
    requestedDateHasSessions || !availableDateKeys.length
      ? selectedDateKey < todayKey
        ? todayKey
        : selectedDateKey
      : availableDateKeys[0];
  const dateOptions = buildDateOptions(availableDateKeys, activeDateKey, todayKey);
  const { events } = await getSessionsByDate(activeDateKey);

  return (
    <ProgrammePageClient
      dateOptions={dateOptions}
      events={events}
      activeDateKey={activeDateKey}
      todayKey={todayKey}
      availableDateKeys={availableDateKeys}
    />
  );
}
