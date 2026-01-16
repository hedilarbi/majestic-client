"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdClose, MdMenu, MdSearch } from "react-icons/md";
import { navLinks } from "../lib/site-data";

const resolveType = (value) => (value === "show" ? "show" : "movie");

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = resolveType(searchParams.get("type"));

  const isLinkActive = useMemo(() => {
    return (href) => {
      if (!href || href === "#") return false;
      if (href.startsWith("/evenements")) {
        if (!pathname.startsWith("/evenements")) return false;
        const linkType = new URL(href, "http://localhost").searchParams.get(
          "type"
        );
        return resolveType(linkType) === currentType;
      }
      if (href.startsWith("/cinema")) {
        return pathname.startsWith("/cinema");
      }
      return pathname === href;
    };
  }, [pathname, currentType]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

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
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  className={`text-sm font-display uppercase tracking-wider transition-all hover:text-accent hover:[text-shadow:0_0_20px_rgba(116,208,241,0.3)] ${
                    isActive ? "text-accent" : "text-white/70"
                  }`}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
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

      {isMenuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 md:hidden"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="fixed inset-0 bg-black/80" />
              <div
                className="fixed right-0 top-0 flex h-screen w-[75vw] flex-col border-l border-white/10 bg-black p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-8 flex items-center justify-between">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Image
                      src="/images/logo_light.png"
                      alt="Lumière Cinéma"
                      width={120}
                      height={32}
                      className="h-10 w-auto"
                    />
                  </Link>
                  <button
                    className="rounded-full border border-white/20 p-2 text-white/70 transition hover:text-white"
                    type="button"
                    aria-label="Fermer le menu"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdClose className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-5">
                  {navLinks.map((link) => {
                    const isActive = isLinkActive(link.href);
                    return (
                      <Link
                        key={link.label}
                        className={`text-base font-display uppercase tracking-wider transition-all ${
                          isActive
                            ? "text-accent"
                            : "text-white/80 hover:text-accent"
                        }`}
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-auto">
                  <button
                    className="w-full rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(116,208,241,0.3)]"
                    type="button"
                  >
                    Connexion
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <a
                      className="rounded-full border border-white/20 p-2 text-white/60 transition hover:border-accent hover:text-accent"
                      href="#"
                      aria-label="Facebook"
                    >
                      <FaFacebookF className="h-4 w-4" />
                    </a>
                    <a
                      className="rounded-full border border-white/20 p-2 text-white/60 transition hover:border-accent hover:text-accent"
                      href="#"
                      aria-label="Instagram"
                    >
                      <FaInstagram className="h-4 w-4" />
                    </a>
                    <a
                      className="rounded-full border border-white/20 p-2 text-white/60 transition hover:border-accent hover:text-accent"
                      href="#"
                      aria-label="X"
                    >
                      <FaXTwitter className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </header>
  );
}
