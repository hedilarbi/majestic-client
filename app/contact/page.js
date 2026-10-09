import {
  ContactLines,
  StaticLink,
  StaticPage,
  StaticSection,
} from "../components/StaticPage";
import { contactInfo, socialLinks } from "../lib/site-data";

export const metadata = {
  title: "Nous contacter | Majestic Bizerte",
  description:
    "Une question sur une séance, un billet, un abonnement ou l’organisation d’un événement ? Contactez l’équipe du Majestic Bizerte.",
};

export default function ContactPage() {
  const hasContactDetails = Boolean(contactInfo.email || contactInfo.phone);

  return (
    <StaticPage
      title="Nous contacter"
      intro="Une question sur une séance, un billet, un abonnement ou l’organisation d’un événement ? L’équipe du Majestic est à votre écoute."
    >
      {hasContactDetails ? (
        <StaticSection title="Nous joindre">
          <ContactLines email={contactInfo.email} phone={contactInfo.phone} />
        </StaticSection>
      ) : null}

      <StaticSection title="Pour une réservation ou un abonnement">
        <p>
          Afin de faciliter le traitement de votre demande, indiquez le nom de
          l’événement, la date et l’heure de la séance, ainsi que votre
          référence de réservation si vous en possédez une. Si votre message
          concerne un abonnement, précisez le nom de l’offre et l’adresse
          e-mail utilisée pour votre achat.
        </p>
        <p>
          Ne transmettez jamais votre mot de passe, le numéro complet de votre
          carte bancaire ou son code de sécurité.
        </p>
      </StaticSection>

      <StaticSection title="Pour organiser un événement">
        <p>
          Utilisez la rubrique{" "}
          <StaticLink href="/reserver-espace">« Réserver nos espaces »</StaticLink>{" "}
          et précisez l’espace souhaité, la date, les horaires, le nombre de
          participants et vos besoins techniques. Votre demande sera étudiée
          par notre équipe ; l’envoi du formulaire ne vaut pas confirmation de
          disponibilité ni réservation définitive.
        </p>
      </StaticSection>

      <StaticSection title="Suivre Le Majestic">
        <ul className="space-y-1">
          {socialLinks.map((social) => (
            <li key={social.label}>
              {social.label} :{" "}
              <StaticLink href={social.href}>
                {social.href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </StaticLink>
            </li>
          ))}
        </ul>
      </StaticSection>
    </StaticPage>
  );
}
