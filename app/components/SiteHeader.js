"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdClose, MdMenu, MdSearch } from "react-icons/md";
import { navLinks } from "../lib/site-data";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-md">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex h-24 items-center justify-between px-10 sm:px-12 lg:px-20"
      >
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2" href="/">
            <Image
              src="/images/logo_light.png"
              alt="Lumière Cinéma"
              width={140}
              height={40}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                className="text-sm font-display uppercase tracking-wider text-white/70 transition-all hover:text-accent hover:[text-shadow:0_0_20px_rgba(116,208,241,0.3)]"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MdSearch className="h-5 w-5 text-white/50" />
            </div>
            <input
              aria-label="Rechercher des films"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 font-body"
              placeholder="Rechercher des films..."
              type="search"
            />
          </div>
          <button className="hidden rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(116,208,241,0.3)] md:inline-flex">
            Connexion
          </button>
          <button
            className="inline-flex items-center justify-center rounded-full border border-white/20 p-2 text-white/80 transition-all hover:border-accent hover:text-accent md:hidden"
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <MdMenu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute right-4 top-6 w-[min(90vw,360px)] rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60 font-display">
                Menu
              </span>
              <button
                className="rounded-full border border-white/20 p-2 text-white/70 transition hover:text-white"
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  className="text-sm font-display uppercase tracking-wider text-white/80 transition-all hover:text-accent"
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              className="mt-6 w-full rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(116,208,241,0.3)]"
              type="button"
            >
              Connexion
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
