"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdCardMembership,
  MdClose,
  MdConfirmationNumber,
  MdLogout,
  MdMenu,
  MdPayments,
  MdPerson,
} from "react-icons/md";

const navItems = [
  { label: "Mon profil", icon: MdPerson, href: "/profil" },
  { label: "Mes billets", icon: MdConfirmationNumber, href: "/profil/billets" },
  { label: "Paiements", icon: MdPayments, href: "/profil/paiements" },
  { label: "Abonnements", icon: MdCardMembership, href: "/profil/abonnements" },
];

const isActiveRoute = (pathname, href) =>
  pathname === href || (href !== "/profil" && pathname.startsWith(href));

const getInitials = (user) => {
  if (!user) return "MP";
  const first = user.firstName?.trim()?.[0] || "";
  const last = user.lastName?.trim()?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  if (user.email) return user.email.trim()[0]?.toUpperCase() || "MP";
  return "MP";
};

const getDisplayName = (user) => {
  if (!user) return "Compte Majestic";
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return name || user.email || "Compte Majestic";
};

export function ProfilSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/connexion");
    }
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-8 lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100vh-10rem)]">
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-lg font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              Compte
            </p>
            <h3 className="text-base font-semibold text-white font-display">
              {displayName}
            </h3>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-2 text-sm font-body">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isActive
                    ? "border border-primary/40 bg-primary/15 text-white shadow-[0_0_20px_rgba(16,52,166,0.25)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200"
            type="button"
            onClick={handleLogout}
          >
            <MdLogout className="h-5 w-5" />
            <span className="text-sm font-medium">Deconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function ProfilMobileNav({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = getInitials(user);
  const displayName = getDisplayName(user);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeItem = useMemo(
    () =>
      navItems.find((item) => isActiveRoute(pathname, item.href)) || navItems[0],
    [pathname],
  );

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsDrawerOpen(false);
      router.replace("/connexion");
    }
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-white/10 bg-black/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-lg font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Compte
              </p>
              <h3 className="text-base font-semibold text-white font-display">
                {displayName}
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                {activeItem?.label || "Mon profil"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-accent hover:text-accent"
            aria-label="Ouvrir le menu profil"
          >
            <MdMenu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isDrawerOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 lg:hidden"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsDrawerOpen(false)}
            >
              <div className="absolute inset-0 bg-black/80" />
              <div
                className="absolute right-0 top-0 h-full w-[84vw] max-w-sm border-l border-white/10 bg-[#0d1218] p-5 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                    Navigation profil
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80"
                    aria-label="Fermer le menu profil"
                  >
                    <MdClose className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-5 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-sm font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{displayName}</p>
                    </div>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(pathname, item.href);
                    return (
                      <Link
                        key={`drawer-${item.label}`}
                        href={item.href}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "border border-primary/40 bg-primary/15 text-white"
                            : "border border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                  >
                    <MdLogout className="h-5 w-5" />
                    Deconnexion
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
