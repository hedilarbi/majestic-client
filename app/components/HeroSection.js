"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdArrowBack,
  MdArrowForward,
  MdConfirmationNumber,
  MdSchedule,
} from "react-icons/md";
import { heroCtas } from "../lib/site-data";

const AUTOPLAY_DELAY = 7000;

export default function HeroSection({ slides = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;
  const safeIndex = slideCount > 0 ? Math.min(activeIndex, slideCount - 1) : 0;

  useEffect(() => {
    if (slideCount <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTOPLAY_DELAY);

    return () => clearInterval(interval);
  }, [slideCount]);

  const handlePrev = () => {
    setActiveIndex((current) => (current - 1 + slideCount) % slideCount);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % slideCount);
  };

  return (
    <section className="relative w-full">
      <div className="relative h-[85vh] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.id ?? index}
              className="relative h-full min-w-full"
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
              <div className="relative z-10 mx-auto flex h-full w-full items-center px-10 sm:px-12 lg:px-24">
                <div className="max-w-2xl space-y-6">
                  <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-7xl font-display">
                    <span className="text-glow bg-gradient-to-r from-white via-white/90 to-accent bg-clip-text text-transparent">
                      {slide.titleHighlight}
                    </span>
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-white/80 font-body">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Link
                      className="group relative overflow-hidden rounded-lg bg-primary px-8 py-4 text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,52,166,0.4)]"
                      href={
                        slide.eventId
                          ? `/evenements/${slide.eventId}`
                          : "/evenements"
                      }
                    >
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1s_infinite]" />
                      <span className="relative flex items-center gap-2 tracking-wide font-display">
                        {heroCtas.primary}
                        <MdConfirmationNumber className="h-5 w-5" />
                      </span>
                    </Link>
                    {/* <button className="neon-border flex items-center gap-2 rounded-lg border border-white/20 bg-transparent px-8 py-4 text-white transition-all hover:border-accent hover:bg-primary/10 hover:text-accent font-display">
                      {heroCtas.secondary}
                      <MdSchedule className="h-5 w-5" />
                    </button> */}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {slideCount > 1 ? (
          <>
            <div className="absolute inset-y-0 left-4 z-20 flex items-center">
              <button
                aria-label="Diapositive précédente"
                className="rounded-full border border-white/20 bg-black/40 p-3 text-white transition hover:bg-black/60"
                onClick={handlePrev}
                type="button"
              >
                <MdArrowBack className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-4 z-20 flex items-center">
              <button
                aria-label="Diapositive suivante"
                className="rounded-full border border-white/20 bg-black/40 p-3 text-white transition hover:bg-black/60"
                onClick={handleNext}
                type="button"
              >
                <MdArrowForward className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id ?? `dot-${index}`}
                  aria-label={`Aller à la diapositive ${index + 1}`}
                  className={`h-2 w-10 rounded-full transition ${
                    index === safeIndex
                      ? "bg-accent"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
