import ConnexionForm from "./ConnexionForm";

export const metadata = {
  title: "Connexion | Majestic",
  description:
    "Connectez-vous à votre compte Majestic pour gérer vos réservations.",
};

export default function ConnexionPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 pb-20 pt-12 text-white sm:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[50vh] w-[70vw] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px] opacity-70" />
        <div className="absolute bottom-0 left-0 h-[40vh] w-[45vw] rounded-full bg-accent/10 blur-[120px] opacity-60" />
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl font-display text-glow">
            Connexion
          </h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
          <ConnexionForm />
        </div>
      </div>
    </main>
  );
}
