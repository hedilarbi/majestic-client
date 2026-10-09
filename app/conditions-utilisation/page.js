import {
  ContactLines,
  StaticLink,
  StaticPage,
  StaticSection,
} from "../components/StaticPage";
import { contactInfo } from "../lib/site-data";

export const metadata = {
  title: "Conditions d’utilisation et de réservation | Majestic Bizerte",
  description:
    "Conditions d’utilisation du site majestic-bizerte.tn et principales règles de réservation au Majestic Bizerte.",
};

export default function ConditionsUtilisationPage() {
  return (
    <StaticPage
      title="Conditions d’utilisation et de réservation"
      intro="Les présentes conditions décrivent l’utilisation du site majestic-bizerte.tn et les principales règles de réservation au Majestic Bizerte. Les conditions particulières affichées pour une séance, un tarif ou une offre complètent ces informations."
    >
      <StaticSection title="Consulter notre programmation">
        <p>
          Le site présente les films, spectacles, horaires, actualités et
          offres disponibles. Les informations sont mises à jour selon la
          programmation. Avant de finaliser une réservation, vérifiez le titre
          de l’événement, la date, l’heure, les sièges et les éventuelles
          restrictions d’accès indiquées pour la séance.
        </p>
      </StaticSection>

      <StaticSection title="Réserver et payer">
        <p>
          Choisissez une séance disponible, sélectionnez vos places puis
          attribuez un tarif à chaque billet. Le montant total à régler est
          présenté avant le paiement, en dinars tunisiens. Une réservation
          payante est confirmée après validation du règlement et affichage de
          la confirmation de réservation.
        </p>
        <p>
          Vous disposez de 20 minutes pour finaliser le paiement à compter du
          passage à l’étape de paiement. À l’expiration de ce délai, une
          réservation non réglée peut être annulée et les places remises à
          disposition. Si une erreur apparaît après un paiement accepté,
          contactez-nous avec votre référence avant de recommencer un achat.
        </p>
      </StaticSection>

      <StaticSection title="Vos coordonnées et votre confirmation">
        <p>
          Renseignez une adresse e-mail correcte et accessible afin de recevoir
          les informations liées à votre réservation. Conservez votre
          référence et le billet ou justificatif de réservation remis à
          l’issue de l’achat. Vérifiez vos messages indésirables si l’e-mail
          de confirmation n’apparaît pas dans votre boîte de réception.
        </p>
      </StaticSection>

      <StaticSection title="Accès aux séances et tarifs réduits">
        <p>
          Chaque billet permet l’entrée d’une seule personne pour la séance
          indiquée. Les enfants de moins de 2 ans ne sont pas admis. Les
          éventuelles restrictions d’âge propres à un film ou à un spectacle
          s’appliquent également.
        </p>
        <p>
          Les tarifs Élève, Étudiant ou Enfant sont accessibles selon les
          conditions indiquées au moment de la réservation. Un justificatif
          peut être demandé lorsque le tarif le prévoit. Pour les séances
          signalées comme exigeant un accompagnement, les enfants doivent être
          accompagnés d’un adulte disposant de son propre billet.
        </p>
        <p>
          En salle, respectez les consignes de l’équipe et la tranquillité des
          autres spectateurs. Les enregistrements non autorisés des
          projections ou spectacles sont interdits.
        </p>
      </StaticSection>

      <StaticSection title="Abonnements et offres">
        <p>
          Chaque abonnement ou offre possède ses propres conditions : prix,
          nombre de crédits, durée de validité, séances éligibles et
          éventuelles limites d’utilisation. Consultez ces conditions avant de
          souscrire. Un abonnement payant devient utilisable après validation
          de son achat. L’utilisation d’un crédit suit les règles précisées
          pour l’offre concernée ; elle ne dispense pas de réserver une place
          disponible.
        </p>
      </StaticSection>

      <StaticSection title="Modification, annulation et assistance">
        <p>
          Pour toute demande de modification, d’annulation ou de
          remboursement, contactez le Majestic en précisant votre référence,
          l’événement et la séance concernés. Les conditions particulières
          annoncées avant l’achat et les dispositions légales applicables sont
          prises en compte dans le traitement de votre demande.
        </p>
        <p>
          Si une séance est annulée ou modifiée à l’initiative du Majestic,
          notre équipe vous informe des modalités de prise en charge de votre
          réservation. Ne considérez pas une demande envoyée comme acceptée
          tant que vous n’avez pas reçu de confirmation de notre équipe.
        </p>
      </StaticSection>

      <StaticSection title="Demandes de location d’espace">
        <p>
          Le formulaire{" "}
          <StaticLink href="/reserver-espace">« Réserver nos espaces »</StaticLink>{" "}
          permet de présenter un projet. Son envoi ne constitue pas une
          réservation définitive. Les disponibilités, prestations, tarifs et
          conditions d’accueil sont confirmés dans un échange distinct avec
          l’équipe du Majestic.
        </p>
      </StaticSection>

      <StaticSection title="Compte et utilisation du site">
        <p>
          Lorsque vous utilisez un compte, protégez vos identifiants et
          fournissez des informations exactes. N’utilisez pas le site pour
          perturber son fonctionnement ou accéder aux données d’autres
          utilisateurs. Les textes, images et autres contenus ne peuvent être
          réutilisés au-delà des droits accordés par leurs titulaires et par
          la loi.
        </p>
      </StaticSection>

      <StaticSection title="Nous contacter">
        <ContactLines email={contactInfo.email} phone={contactInfo.phone} />
        <p>
          Retrouvez toutes les façons de nous joindre sur la page{" "}
          <StaticLink href="/contact">Nous contacter</StaticLink>.
        </p>
      </StaticSection>
    </StaticPage>
  );
}
