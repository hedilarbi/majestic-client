"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export default function HomeHorizontalCarousel({ children, label }) {
  const scrollerRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateControls = useCallback(() => {
    const element = scrollerRef.current;
    if (!element) return;
    setCanGoBack(element.scrollLeft > 4);
    setCanGoForward(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    updateControls();
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(element);
    element.addEventListener("scroll", updateControls, { passive: true });

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener("scroll", updateControls);
    };
  }, [children, updateControls]);

  const scroll = (direction) => {
    const element = scrollerRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        aria-label={label}
        className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-8"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label={`Faire défiler ${label} vers la gauche`}
        onClick={() => scroll(-1)}
        disabled={!canGoBack}
        className="absolute -left-16 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-accent text-black shadow-[0_0_20px_rgba(116,208,241,0.35)] transition hover:scale-105 hover:brightness-110 hover:shadow-[0_0_28px_rgba(116,208,241,0.55)] disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        <MdArrowBack className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={`Faire défiler ${label} vers la droite`}
        onClick={() => scroll(1)}
        disabled={!canGoForward}
        className="absolute -right-16 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-accent text-black shadow-[0_0_20px_rgba(116,208,241,0.35)] transition hover:scale-105 hover:brightness-110 hover:shadow-[0_0_28px_rgba(116,208,241,0.55)] disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        <MdArrowForward className="h-5 w-5" />
      </button>
    </div>
  );
}
