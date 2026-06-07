"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdClose, MdMenu } from "react-icons/md";
import { RiSearchLine } from "react-icons/ri";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ events: [], articles: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);
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

  // Focus input when search modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults({ events: [], articles: [] });
    }
  }, [isSearchOpen]);

  // Close search on Escape
  useEffect(() => {
    if (!isSearchOpen) return;
    const handler = (e) => { if (e.key === "Escape") setIsSearchOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults({ events: [], articles: [] });
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json().catch(() => ({}));
        setSearchResults({
          events: Array.isArray(data?.events) ? data.events : [],
          articles: Array.isArray(data?.articles) ? data.articles : [],
        });
      } catch {
        setSearchResults({ events: [], articles: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

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
          {/* Search button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-accent/50 hover:text-accent"
            aria-label="Rechercher"
          >
            <RiSearchLine className="h-5 w-5" />
          </button>
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

      {/* Search modal */}
      {isSearchOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-9999 flex flex-col items-center bg-black/85 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget) setIsSearchOpen(false); }}
            >
              {/* Search bar at top */}
              <div className="w-full max-w-2xl px-4 pt-16 sm:pt-20">
                <div className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-xl">
                  <RiSearchLine className="h-5 w-5 shrink-0 text-white/50" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un film, spectacle, article…"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="shrink-0 text-white/40 hover:text-white"
                    >
                      <MdClose className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="shrink-0 rounded-lg border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/45 transition hover:text-white"
                  >
                    ESC
                  </button>
                </div>

                {/* Suggestions */}
                {isSearching ? (
                  <div className="mt-3 px-2 text-sm text-white/40">Recherche…</div>
                ) : (searchResults.events.length > 0 || searchResults.articles.length > 0) ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl">
                    {searchResults.events.length > 0 ? (
                      <div className="px-4 pb-2 pt-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                          Événements
                        </p>
                        {searchResults.events.map((ev) => (
                          <Link
                            key={ev._id}
                            href={`/evenements/${ev._id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
                          >
                            {ev.poster ? (
                              <Image
                                src={ev.poster}
                                alt={ev.name}
                                width={32}
                                height={48}
                                className="h-12 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="h-12 w-8 rounded bg-white/10" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">{ev.name}</p>
                              {ev.genres?.length ? (
                                <p className="text-xs text-white/45">{ev.genres[0]}</p>
                              ) : null}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {searchResults.articles.length > 0 ? (
                      <div className={`px-4 pb-3 ${searchResults.events.length > 0 ? "border-t border-white/10 pt-3" : "pt-3"}`}>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                          Actualités
                        </p>
                        {searchResults.articles.map((art) => (
                          <Link
                            key={art._id}
                            href={`/actualite/${art.slug || art._id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
                          >
                            {(art.thumbnail || art.image) ? (
                              <Image
                                src={art.thumbnail || art.image}
                                alt={art.title}
                                width={48}
                                height={32}
                                className="h-8 w-12 rounded object-cover"
                              />
                            ) : (
                              <div className="h-8 w-12 rounded bg-white/10" />
                            )}
                            <p className="text-sm font-semibold text-white line-clamp-1">{art.title}</p>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="mt-3 px-2 text-sm text-white/40">Aucun résultat pour &laquo; {searchQuery} &raquo;</div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
