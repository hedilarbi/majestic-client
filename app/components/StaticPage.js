import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";

// Shared layout for the text pages of the footer (À propos, contact, legal).
export function StaticPage({ title, intro, children }) {
  return (
    <main className="relative min-h-screen px-4 pb-20 pt-6 text-white sm:px-8 lg:px-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[50vh] w-[70vw] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px] opacity-60" />
      </div>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-accent"
        >
          <RiArrowLeftLine className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-5xl font-display">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg font-body">
            {intro}
          </p>
        ) : null}
        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </main>
  );
}

export function StaticSection({ title, children }) {
  return (
    <section className="space-y-4">
      {title ? (
        <h2 className="flex items-center gap-3 text-xl font-semibold text-white sm:text-2xl font-display">
          <span className="block h-6 w-1 rounded-full bg-accent" />
          {title}
        </h2>
      ) : null}
      <div className="space-y-4 text-sm leading-7 text-white/70 sm:text-base font-body">
        {children}
      </div>
    </section>
  );
}

export function StaticLink({ href, children }) {
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-accent underline-offset-4 hover:underline"
      >
        {children}
        <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="font-semibold text-accent underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

// E-mail / phone lines, only for the values that are filled in.
export function ContactLines({ email, phone }) {
  if (!email && !phone) return null;
  return (
    <ul className="space-y-1">
      {email ? (
        <li>
          E-mail : <StaticLink href={`mailto:${email}`}>{email}</StaticLink>
        </li>
      ) : null}
      {phone ? (
        <li>
          Téléphone :{" "}
          <StaticLink href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</StaticLink>
        </li>
      ) : null}
    </ul>
  );
}
