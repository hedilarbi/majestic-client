import { getSessionsByDate } from "../lib/cinema-api";
import ProgrammePageClient from "./programmePageClient";

const DAYS_TO_SHOW = 10;
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

const buildDateOptions = (startDate, selectedKey) => {
  const options = [];
  for (let index = 0; index < DAYS_TO_SHOW; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const value = formatDateKey(date);
    options.push({
      value,
      label: index === 0 ? "AUJ" : index === 1 ? "DEM" : formatWeekday(date),
      day: String(date.getDate()),
      month: formatMonth(date),
      isActive: value === selectedKey,
    });
  }
  return options;
};

export default async function CinemaPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const today = new Date();
  const todayKey = formatDateKey(today);
  const requestedDate = parseDateParam(resolvedParams?.date);
  const selectedDateKey = requestedDate
    ? formatDateKey(requestedDate)
    : todayKey;
  const activeDateKey = selectedDateKey < todayKey ? todayKey : selectedDateKey;
  const dateOptions = buildDateOptions(today, activeDateKey);
  const { events } = await getSessionsByDate(activeDateKey);

  return (
    <ProgrammePageClient
      dateOptions={dateOptions}
      events={events}
      activeDateKey={activeDateKey}
      todayKey={todayKey}
    />
  );
}
