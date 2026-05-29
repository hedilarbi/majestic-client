import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublie | Majestic",
  description: "Recevez un code pour reinitialiser votre mot de passe.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 pb-20 pt-12 text-white sm:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[55vh] w-[75vw] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px] opacity-70" />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[45vw] rounded-full bg-accent/10 blur-[120px] opacity-60" />
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            Réinitialisation
          </p>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl font-display text-glow">
            Mot de passe oublie
          </h1>
          <p className="mt-3 text-sm text-white/60 font-body">
            Entrez votre email pour recevoir un code de réinitialisation.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
