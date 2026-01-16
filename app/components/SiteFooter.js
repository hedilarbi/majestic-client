import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "../lib/site-data";

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path
          clipRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          fillRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.072 4.072 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.095 4.095 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.616 11.616 0 0 0 6.29 1.84" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path
          clipRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 0 1 1.772 1.153 4.902 4.902 0 0 1 1.153 1.772c.247.636.416 1.363.416 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 0 1 1.153-1.772 4.902 4.902 0 0 1 1.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-3.196 8.42a3.196 3.196 0 1 0 0 6.392 3.196 3.196 0 0 0 0-6.392zm0-2.19a5.387 5.387 0 0 1 5.387 5.387 5.387 5.387 0 0 1-5.387 5.387 5.387 5.387 0 0 1-5.387-5.387 5.387 5.387 0 0 1 5.387-5.387zM17.657 5.657a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"
          fillRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function SiteFooter() {
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
                  {social.icon}
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
