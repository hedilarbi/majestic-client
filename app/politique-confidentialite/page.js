import {
  ContactLines,
  StaticLink,
  StaticPage,
  StaticSection,
} from "../components/StaticPage";
import { contactInfo } from "../lib/site-data";

export const metadata = {
  title: "Politique de confidentialité | Majestic Bizerte",
  description:
    "Utilisation des données personnelles liées aux services du site majestic-bizerte.tn.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <StaticPage
      title="Politique de confidentialité"
      intro="Cette page vous informe sur l’utilisation des données personnelles liées aux services du site majestic-bizerte.tn. Pour toute question concernant vos informations, vous pouvez contacter l’équipe du Majestic aux coordonnées indiquées ci-dessous."
    >
      <StaticSection title="Informations concernées et utilisation">
        <p>
          Selon le service utilisé, vous renseignez notamment votre nom, votre
          prénom, votre adresse e-mail et, lorsque le formulaire le demande,
          votre numéro de téléphone. Vos demandes, réservations et abonnements
          peuvent également comporter des informations relatives aux
          événements choisis, aux sièges, aux tarifs et aux références de
          transaction.
        </p>
        <p>
          Ces informations permettent de traiter vos demandes, gérer vos
          réservations ou abonnements, vous adresser les confirmations
          correspondantes et répondre à vos questions. Fournissez uniquement
          les informations nécessaires au service demandé. Les champs
          obligatoires sont signalés dans les formulaires.
        </p>
      </StaticSection>

      <StaticSection title="Paiement et destinataires">
        <p>
          Le paiement est effectué dans l’interface de paiement proposée au
          moment du règlement. Ne communiquez jamais votre code de sécurité
          bancaire dans un message adressé au Majestic. Pour une assistance,
          utilisez votre référence de réservation ou de transaction.
        </p>
        <p>
          Les informations nécessaires au service sont accessibles aux
          personnes habilitées de notre équipe et aux prestataires qui
          interviennent pour assurer les services concernés, notamment le
          fonctionnement technique, le paiement et l’envoi des confirmations.
          Elles doivent être utilisées dans le cadre de ces missions et des
          obligations applicables.
        </p>
      </StaticSection>

      <StaticSection title="Conservation et sécurité">
        <p>
          Les informations sont conservées pendant la durée nécessaire au
          traitement de votre demande, à la gestion du service et au respect
          des obligations applicables. L’accès aux données doit être limité
          aux personnes qui en ont besoin. Nous mettons en œuvre des mesures
          adaptées pour protéger les informations traitées et prévenir les
          accès non autorisés.
        </p>
      </StaticSection>

      <StaticSection title="Vos droits et votre contact">
        <p>
          Vous pouvez demander l’accès aux informations qui vous concernent et
          la rectification des données inexactes. Pour toute demande relative
          à vos données personnelles, contactez-nous en précisant l’adresse
          e-mail utilisée sur le site et l’objet de votre demande. Une
          vérification de votre identité peut être nécessaire pour protéger
          vos informations.
        </p>
        <ContactLines email={contactInfo.email} phone={contactInfo.phone} />
        <p>
          Voir aussi la page{" "}
          <StaticLink href="/contact">Nous contacter</StaticLink>.
        </p>
      </StaticSection>

      <StaticSection title="Cookies et services externes">
        <p>
          Certaines fonctionnalités nécessitent des informations techniques
          pour maintenir votre connexion, conserver les étapes de votre
          réservation ou assurer le fonctionnement du site. Les vidéos,
          paiements et réseaux sociaux peuvent vous conduire vers des services
          externes ; leurs propres politiques de confidentialité s’appliquent
          lorsque vous les utilisez.
        </p>
        <p>
          Lorsque le site propose des usages facultatifs de cookies ou de
          traceurs, les informations correspondantes et les choix disponibles
          sont présentés au moment concerné.
        </p>
      </StaticSection>

      <StaticSection title="Mise à jour de cette politique">
        <p>
          Cette politique peut être actualisée pour refléter l’évolution des
          services et des informations associées. La version en vigueur est
          disponible sur cette page.
        </p>
      </StaticSection>
    </StaticPage>
  );
}
