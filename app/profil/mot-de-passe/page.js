import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Changer mot de passe | Majestic",
  description: "Mettez à jour votre mot de passe en toute sécurité.",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div>
        <h1 className="mt-2 text-3xl font-display uppercase text-white">
          Changer le mot de passe
        </h1>
      </div>

      <div className="max-w-2xl rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
