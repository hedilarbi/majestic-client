const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// "Valable jusqu'au 30 novembre 2026" while the offer is active,
// "Offre expirée" once the date is past (C17).
export const formatOfferValidity = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (date.getTime() < Date.now()) return "Offre expirée";
  return `Valable jusqu’au ${DATE_FORMATTER.format(date)}`;
};
