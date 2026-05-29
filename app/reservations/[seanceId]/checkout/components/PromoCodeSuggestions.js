"use client";

import { useEffect, useState } from "react";
import { RiLockLine, RiPriceTag3Line } from "react-icons/ri";

const formatReduction = (code) => {
  const value = Number(code.reductionValue);
  if (!Number.isFinite(value)) return "";
  return code.reductionType === "percent"
    ? `-${value}%`
    : `-${value.toFixed(2).replace(".", ",")} DT`;
};

export default function PromoCodeSuggestions({ onSelect, isAuthenticated }) {
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    fetch("/api/promo-codes/available")
      .then((r) => r.json())
      .then((data) => setCodes(Array.isArray(data?.promoCodes) ? data.promoCodes : []))
      .catch(() => {});
  }, []);

  if (!codes.length) return null;

  return (
    <div className="mt-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
        Codes disponibles
      </p>
      <div className="flex flex-wrap gap-2">
        {codes.map((code) => (
          <button
            key={code._id || code.code}
            type="button"
            onClick={() => onSelect(code.code)}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
          >
            {code.availability === "private" ? (
              <RiLockLine className="h-3 w-3 shrink-0 text-white/40 group-hover:text-accent/70" />
            ) : (
              <RiPriceTag3Line className="h-3 w-3 shrink-0 text-white/40 group-hover:text-accent/70" />
            )}
            <span className="font-mono tracking-wider">{code.code}</span>
            <span className="text-white/40 group-hover:text-accent/60">
              {formatReduction(code)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
