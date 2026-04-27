import { RiArmchairFill, RiArmchairLine } from "react-icons/ri";

export default function SeatIcon({ status, isFixedPricing = false }) {
  if (status === "selected") {
    return (
      <RiArmchairFill className="h-8 w-8 text-accent drop-shadow-[0_0_10px_rgba(116,208,241,0.5)]" />
    );
  }

  if (
    status === "occupied" ||
    status === "reserved" ||
    status === "booked" ||
    status === "blocked" ||
    status === "staff"
  ) {
    return <RiArmchairFill className="h-8 w-8 text-red-500" />;
  }

  if (isFixedPricing) {
    return (
      <RiArmchairLine className="h-8 w-8 text-accent drop-shadow-[0_0_8px_rgba(116,208,241,0.35)]" />
    );
  }

  return (
    <RiArmchairLine className="h-8 w-8 text-white/25 transition-colors hover:text-accent" />
  );
}
