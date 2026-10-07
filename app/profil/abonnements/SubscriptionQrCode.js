"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdZoomOutMap } from "react-icons/md";

const buildQrSrc = (code, size) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(code)}`;

export default function SubscriptionQrCode({ code, title }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Afficher le QR code en grand"
          className="rounded-lg transition hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={buildQrSrc(code, 80)}
            alt={`QR ${code}`}
            width={80}
            height={80}
            className="rounded-lg bg-white p-1"
          />
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-accent"
        >
          <MdZoomOutMap className="h-3.5 w-3.5" />
          Agrandir
        </button>
      </div>

      {isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 sm:px-6"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/90 p-6 pt-14 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent"
                  type="button"
                  aria-label="Fermer le QR code"
                  onClick={() => setIsOpen(false)}
                >
                  <MdClose className="h-5 w-5" />
                </button>
                {title ? (
                  <p className="text-center text-lg font-bold uppercase tracking-tight text-white font-display">
                    {title}
                  </p>
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildQrSrc(code, 400)}
                  alt={`QR ${code}`}
                  width={400}
                  height={400}
                  className="aspect-square w-full rounded-xl bg-white p-3"
                />
                <p className="font-mono text-base font-semibold text-white">
                  {code}
                </p>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
