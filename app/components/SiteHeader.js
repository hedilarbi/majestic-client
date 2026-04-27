"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdClose, MdMenu } from "react-icons/md";
import { navLinks } from "../lib/site-data";

const resolveType = (value) => (value === "show" ? "show" : "movie");
const shouldHideChrome = (pathname) =>
  typeof pathname === "string" &&
  pathname.startsWith("/reservations/") &&
  pathname.includes("/checkout/succes");

export default function SiteHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = resolveType(searchParams.get("type"));

  const isLinkActive = useMemo(() => {
    return (href) => {
      if (!href || href === "#") return false;
      if (href.startsWith("/evenements")) {
        if (!pathname.startsWith("/evenements")) return false;
        const linkType = new URL(href, "http://localhost").searchParams.get(
          "type",
        );
        return resolveType(linkType) === currentType;
      }
      if (href.startsWith("/programme")) {
        return pathname.startsWith("/programme");
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

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          if (isMounted) {
            setCurrentUser(null);
          }
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (isMounted) {
          setCurrentUser(data?.user || null);
        }
      } catch (error) {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isAuthenticated =
    authChecked && currentUser?.role && currentUser.role === "customer";
  const hidden = shouldHideChrome(pathname);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (_error) {
      // Ignore logout transport errors and force local refresh.
    } finally {
      setCurrentUser(null);
      setIsMenuOpen(false);
      setIsLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-md">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex md:h-24 h-16 items-center justify-between px-10 sm:px-12 lg:px-20"
      >
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2" href="/">
            <Image
              src="/images/logo_light.png"
              alt="Lumière Cinéma"
              width={140}
              height={40}
              className="md:h-14 w-auto h-10"
              priority
            />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  className={`text-sm font-display  tracking-wider transition-all hover:text-accent hover:[text-shadow:0_0_20px_rgba(116,208,241,0.3)] ${
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
          {isAuthenticated ? (
            <>
              <Link
                href="/profil"
                className="hidden items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent md:inline-flex"
                aria-label="Mon compte"
              >
                Mon compte
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hidden items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 transition-all hover:border-red-400 hover:bg-red-500/15 hover:text-white md:inline-flex disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/inscription"
                className="hidden rounded-full bg-accent px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(116,208,241,0.35)] transition-all hover:brightness-110 md:inline-flex"
              >
                Inscription
              </Link>
              <Link
                href="/connexion"
                className="hidden rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(116,208,241,0.3)] md:inline-flex"
              >
                Connexion
              </Link>
            </>
          )}
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
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        className="mx-auto flex w-full items-center justify-center rounded-full border border-white/20 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent"
                        href="/profil"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Mon compte"
                      >
                        Mon compte
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full rounded-full border border-red-500/40 bg-red-500/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 transition-all hover:border-red-400 hover:bg-red-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        className="w-full rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(116,208,241,0.35)] transition-all hover:brightness-110"
                        href="/inscription"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Inscription
                      </Link>
                      <Link
                        className="w-full rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(116,208,241,0.3)]"
                        href="/connexion"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                    </div>
                  )}
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
            document.body,
          )
        : null}
    </header>
  );
}
