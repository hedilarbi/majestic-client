import Link from "next/link";
import { getCustomerMe, getTokenCookie } from "../lib/auth-server";
import OtpForm from "./OtpForm";

export const metadata = {
  title: "Verification email | Majestic",
  description:
    "Saisissez le code de verification pour confirmer votre adresse email.",
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) {
    return "t********a@exeple.com";
  }
  const [localPart, domain] = email.split("@");
  if (!localPart) {
    return `t********a@${domain || "exeple.com"}`;
  }
  const first = localPart[0];
  const last = localPart.length > 1 ? localPart[localPart.length - 1] : "";
  const stars = "*".repeat(Math.max(localPart.length - 2, 1));
  return `${first}${stars}${last}@${domain}`;
};

const resolveRedirectPath = (value) => {
  if (typeof value !== "string") {
    return "/profil";
  }
  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/profil";
  }
  return trimmed;
};

export default async function VerifyEmailPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const token = await getTokenCookie();
  const infoMessage =
    typeof resolvedParams?.info === "string" ? resolvedParams.info : "";
  const otpError =
    typeof resolvedParams?.error === "string" ? resolvedParams.error : "";
  const redirectPath = resolveRedirectPath(resolvedParams?.redirect);
  const autoSendOtp =
    String(resolvedParams?.send || "")
      .trim()
      .toLowerCase() === "1";
  let email = "";
  let errorMessage = "";

  if (!token) {
    errorMessage = "Token manquant. Veuillez vous reconnecter.";
  } else {
    try {
      const data = await getCustomerMe(token);
      email = data?.user?.email || "";
    } catch (error) {
      errorMessage = error?.message || "Erreur serveur";
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 pb-20 pt-12 text-white sm:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[55vh] w-[75vw] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px] opacity-70" />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[45vw] rounded-full bg-accent/10 blur-[120px] opacity-60" />
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            Verification
          </p>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl font-display text-glow">
            Verifier votre email
          </h1>
          <p className="mt-3 text-sm text-white/60 font-body">
            Nous avons envoyé un code vers la boîte{" "}
            <span className="text-white">{maskEmail(email)}</span>.
          </p>
          {errorMessage ? (
            <p
              className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
              {infoMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
          <OtpForm
            otpError={otpError}
            redirectPath={redirectPath}
            autoSendOtp={autoSendOtp}
          />

          <div className="mt-8 h-px w-full bg-white/10" />
        </div>
      </div>
    </main>
  );
}
