"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { footerLinks } from "../lib/site-data";

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    Icon: FaFacebookF,
  },
  {
    label: "Twitter",
    href: "#",
    Icon: FaXTwitter,
  },
  {
    label: "Instagram",
    href: "#",
    Icon: FaInstagram,
  },
];

export default function SiteFooter() {
  const pathname = usePathname();
  const hidden =
    typeof pathname === "string" &&
    pathname.startsWith("/reserver-siege/") &&
    pathname.includes("/checkout/succes");

  if (hidden) {
    return null;
  }

  return (
    <footer className="w-full border-t border-white/5 bg-black/90 py-12 text-sm">
      <div className="mx-auto px-10 sm:px-12 lg:px-20">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="/">
              <Image
                src="/images/logo_light.png"
                alt="Lumière Cinéma"
                width={120}
                height={32}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-white/60 font-body">
              Des expériences cinématographiques premium pour les passionnés de
              cinéma moderne.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  className="text-white/50 transition-colors hover:text-white"
                  href={social.href}
                >
                  <span className="sr-only">{social.label}</span>
                  <social.Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-white font-display">{column.title}</h3>
              <ul className="space-y-2 font-body">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-white/60 transition-colors hover:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-white/40 font-body">
            © 2026 Metageex. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
