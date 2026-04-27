import { MdNotificationsActive, MdSecurity } from "react-icons/md";
import { getCustomerMe, getTokenCookie } from "../lib/auth-server";
import ProfilForm from "./ProfilForm";

export const metadata = {
  title: "Profil | Majestic",
  description: "Gérez vos informations personnelles et votre sécurité.",
};

export default async function ProfilPage() {
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold uppercase tracking-tight text-white font-display text-glow">
          Modifier mon profil
        </h1>
        <p className="text-sm text-white/50 font-body">
          Gérez vos informations personnelles et vos préférences de sécurité.
        </p>
      </div>

      <ProfilForm user={user} />
    </div>
  );
}
