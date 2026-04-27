import Link from "next/link";
import { getCustomerMe, getTokenCookie } from "../lib/auth-server";
import { ProfilMobileNav, ProfilSidebar } from "./ProfilSidebar";

export default async function ProfilLayout({ children }) {
  let user = null;
  try {
    const token = await getTokenCookie();
    if (token) {
      const data = await getCustomerMe(token);
      user = data?.user || null;
    }
  } catch (error) {
    user = null;
  }

  const requiresEmailVerification =
    user?.role === "customer" && user?.emailVerified === false;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none absolute -left-[15%] top-[-10%] h-[45vh] w-[45vh] rounded-full bg-primary/20 blur-[140px] opacity-80" />
      <div className="pointer-events-none absolute -right-[15%] bottom-[-10%] h-[45vh] w-[45vh] rounded-full bg-accent/15 blur-[160px] opacity-70" />

      <main className="flex w-full flex-1 flex-col gap-10 px-6 py-8 lg:h-[calc(100vh-8rem)] lg:flex-row lg:overflow-hidden lg:px-20">
        <ProfilSidebar user={user} />

        <section className="flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          <ProfilMobileNav user={user} />
          {requiresEmailVerification ? (
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-amber-100">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                    Vérification requise
                  </p>
                  <p className="text-sm md:text-base">
                    Vous devez vérifier votre adresse email pour acheter des billets
                    ou finaliser un abonnement.
                  </p>
                </div>
                <Link
                  href="/verify-email?redirect=%2Fprofil&send=1&info=Un%20nouveau%20code%20OTP%20vous%20sera%20envoy%C3%A9."
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:brightness-110"
                >
                  Vérifier mon compte
                </Link>
              </div>
            </div>
          ) : null}
          {children}
        </section>
      </main>
    </div>
  );
}
