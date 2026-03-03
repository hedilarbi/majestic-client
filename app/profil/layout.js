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

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none absolute -left-[15%] top-[-10%] h-[45vh] w-[45vh] rounded-full bg-primary/20 blur-[140px] opacity-80" />
      <div className="pointer-events-none absolute -right-[15%] bottom-[-10%] h-[45vh] w-[45vh] rounded-full bg-accent/15 blur-[160px] opacity-70" />

      <main className="flex w-full flex-1 flex-col gap-10 px-6 py-8 lg:h-[calc(100vh-8rem)] lg:flex-row lg:overflow-hidden lg:px-20">
        <ProfilSidebar user={user} />

        <section className="flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          <ProfilMobileNav user={user} />
          {children}
        </section>
      </main>
    </div>
  );
}
