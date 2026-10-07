// FAQ content from "Action SEO de base majestic 17_03_2026.docx".
// Answer block format is documented in app/components/FaqSection.js.

const FILMS = { label: "Voir les films", href: "/#films" };
const SPECTACLES = { label: "Voir les spectacles", href: "/#spectacles" };
const PROGRAMME = { label: "Consulter le programme cinéma", href: "/programme" };

export const homeFaq = [
  {
    question: "Qu’est-ce que le Majestic Bizerte ?",
    answer: [
      "Le Majestic Bizerte est un cinéma et espace culturel situé à Bizerte, dédié à la projection de films, aux spectacles et aux événements culturels.",
      "Ce lieu propose régulièrement des films à l’affiche, nouveautés du cinéma, projections spéciales et événements artistiques destinés au public de Bizerte et de la région.",
      "Le Majestic est aujourd’hui considéré comme un centre culturel et une salle de cinéma à Bizerte, où l’on peut découvrir aussi bien les derniers films du box office que des spectacles et activités culturelles variées.",
      "Achetez vos billets en ligne dès maintenant avec nos e-billets !",
      {
        links: [
          { label: "Découvrir les films", href: "/#films" },
          SPECTACLES,
        ],
      },
    ],
  },
  {
    question: "Quels films sont à l’affiche au cinéma Majestic Bizerte ?",
    answer: [
      "Le cinéma Majestic Bizerte programme régulièrement des films récents, incluant :",
      {
        list: [
          "les derniers films du box office",
          "les nouvelles sorties cinéma",
          "des films pour enfants",
          "des projections spéciales ou culturelles",
        ],
      },
      "La liste des films à l’affiche à Bizerte ainsi que les horaires des séances cinéma sont disponibles dans la programmation officielle.",
      {
        links: [
          { label: "Voir les films actuellement projetés", href: "/#films" },
          PROGRAMME,
        ],
      },
    ],
  },
  {
    question: "Où consulter le programme du cinéma Majestic Bizerte ?",
    answer: [
      "Le programme du cinéma Majestic Bizerte permet de connaître :",
      {
        list: [
          "les films actuellement à l’affiche",
          "les horaires des séances cinéma",
          "les spectacles et événements culturels",
          "les projections spéciales ou avant-premières",
        ],
      },
      "Créez votre compte pour suivre l’actualité et profiter d’offres exclusives.",
      { links: [{ label: "Voir le programme du cinéma", href: "/programme" }] },
    ],
  },
  {
    question:
      "Comment réserver une place pour un film au cinéma Majestic Bizerte ?",
    answer: [
      "Pour voir un film au cinéma Majestic Bizerte, la réservation peut se faire de deux façons :",
      {
        list: [
          "en ligne, via la billetterie du site",
          "directement sur place, au guichet du cinéma",
        ],
      },
      "Vous pouvez ainsi réserver une séance de cinéma, acheter un billet ou choisir votre projection selon les horaires disponibles.",
      {
        links: [
          { label: "Voir les films et les séances", href: "/#films" },
          PROGRAMME,
        ],
      },
    ],
  },
  {
    question: "Le Majestic Bizerte propose-t-il aussi des spectacles ?",
    answer: [
      "Oui. Le Majestic est avant tout aussi un espace culturel à Bizerte avec une salle de spectacle.",
      "En plus des projections de films, l’espace accueille régulièrement :",
      {
        list: [
          "spectacles",
          "théâtre",
          "événements culturels",
          "activités artistiques",
        ],
      },
      "Ces événements participent à la vie culturelle de Bizerte et font du Majestic un lieu culturel important pour la ville.",
      {
        links: [
          { label: "Découvrir les spectacles", href: "/#spectacles" },
          { label: "Voir la programmation", href: "/programme" },
        ],
      },
    ],
  },
  {
    question: "Peut-on réserver le Majestic Bizerte pour un événement ?",
    answer: [
      "Oui. Le Majestic Bizerte peut être réservé comme salle ou espace culturel pour différents types d’événements :",
      {
        list: [
          "projections privées",
          "conférences",
          "événements culturels",
          "spectacles",
          "activités artistiques",
        ],
      },
      "Pour réserver l’espace Majestic, vous pouvez faire une demande directement via la page dédiée ou contacter l’équipe par téléphone.",
      { links: [{ label: "Réserver l’espace", href: "/reserver-espace" }] },
    ],
  },
  {
    question:
      "Quelles activités culturelles peut-on trouver au Majestic Bizerte ?",
    answer: [
      "Le Majestic est un espace culturel à Bizerte qui propose différentes activités :",
      {
        list: [
          "projection de films récents et box office",
          "cinéma pour enfants",
          "événements culturels",
          "spectacles et théâtre",
          "projections spéciales",
        ],
      },
      "Le lieu fonctionne comme un centre culturel et une salle de cinéma ouverte au public de Bizerte.",
      { links: [FILMS, SPECTACLES] },
    ],
  },
  {
    question: "Comment contacter le cinéma Majestic Bizerte ?",
    answer: [
      "Pour toute question concernant :",
      {
        list: [
          "les films à l’affiche",
          "les horaires des séances cinéma",
          "le programme du cinéma",
          "la réservation d’espace",
          "les spectacles ou événements",
        ],
      },
      "vous pouvez contacter directement l’équipe du cinéma Majestic Bizerte.",
    ],
  },
  {
    question:
      "Quels sont les avantages de réserver un billet de cinéma en ligne au Majestic Bizerte ?",
    answer: [
      "Réserver un billet en ligne pour le cinéma Majestic Bizerte permet de profiter de plusieurs avantages :",
      {
        list: [
          "éviter l’attente au guichet",
          "garantir sa place pour les films à l’affiche les plus demandés",
          "consulter facilement les horaires des séances cinéma",
          "accéder rapidement aux nouveaux films et sorties du box office",
        ],
      },
      "La réservation en ligne est une solution simple et rapide pour organiser votre séance et profiter pleinement du cinéma à Bizerte.",
    ],
  },
];

export const reserverEspaceFaq = [
  {
    question: "Qui peut réserver un espace au Majestic Bizerte ?",
    answer: [
      "Les associations, entreprises, institutions et particuliers peuvent faire une demande de réservation pour organiser un événement dans l’un des espaces du Majestic Bizerte. Chaque demande est étudiée afin de garantir que l’activité correspond à la vocation culturelle du lieu.",
    ],
  },
  {
    question: "Quels types d’événements peuvent être organisés au Majestic ?",
    answer: [
      "Le Majestic Bizerte accueille différents types d’événements culturels ou professionnels, notamment :",
      {
        list: [
          "ateliers et formations",
          "conférences et rencontres",
          "projections privées",
          "spectacles ou représentations artistiques",
          "événements associatifs ou culturels",
        ],
      },
      "L’espace peut être utilisé comme salle d’événement ou espace culturel à Bizerte.",
    ],
  },
  {
    question: "Comment réserver une salle ou un espace au Majestic Bizerte ?",
    answer: [
      "Pour réserver un espace au Majestic, il suffit de remplir le formulaire de demande sur cette page en précisant :",
      {
        list: [
          "la date souhaitée",
          "le type d’événement",
          "le nombre de participants",
        ],
      },
      "L’équipe du Majestic vous contactera ensuite pour confirmer la disponibilité et organiser la réservation.",
    ],
  },
  {
    question: "Peut-on organiser un atelier ou une formation au Majestic ?",
    answer: [
      "Oui. Le Majestic est régulièrement utilisé pour des ateliers, formations ou activités pédagogiques organisés par des associations, collectifs ou intervenants culturels.",
      "Ces événements peuvent être organisés dans l’un des espaces ou salles du Majestic Bizerte, selon la taille et la nature de l’activité.",
    ],
  },
  {
    question: "Est-il possible d’organiser un événement culturel ou artistique ?",
    answer: [
      "Oui. Le Majestic Bizerte est un espace culturel dédié à la diffusion artistique et culturelle.",
      "Il est possible d’y organiser :",
      {
        list: [
          "spectacles",
          "performances artistiques",
          "projections culturelles",
          "événements associatifs",
        ],
      },
    ],
  },
  {
    question: "Combien de temps à l’avance faut-il réserver un espace ?",
    answer: [
      "Il est conseillé de faire une demande de réservation à l’avance, afin de vérifier la disponibilité des salles et de préparer l’organisation de l’événement.",
      "L’équipe du Majestic vous informera rapidement des créneaux disponibles.",
    ],
  },
  {
    question: "Les espaces du Majestic peuvent-ils accueillir des groupes ?",
    answer: [
      "Oui. Les salles et espaces du Majestic peuvent accueillir différents types de groupes, selon la nature de l’événement organisé.",
      "Lors de votre demande de réservation, il est recommandé d’indiquer le nombre de participants prévu afin de proposer l’espace le plus adapté.",
    ],
  },
  {
    question: "Comment obtenir plus d’informations sur la réservation ?",
    answer: [
      "Si vous avez des questions concernant la réservation d’un espace au Majestic Bizerte, vous pouvez :",
      {
        list: [
          "remplir le formulaire de demande",
          "contacter directement l’équipe du Majestic",
        ],
      },
      "Cela permettra d’échanger sur votre projet et les possibilités d’organisation.",
    ],
  },
];

// The document links to /reserver, which does not exist: booking starts from
// the programme (pick a séance), so every link goes to /programme.
const prog = (label) => ({ label, href: "/programme" });

export const evenementsFaq = [
  {
    question:
      "Comment réserver un événement au Ciné-Théâtre Le Majestic à Bizerte ?",
    answer: [
      [
        "La réservation se fait directement en ligne en quelques secondes. Il suffit de consulter le ",
        prog("programme des événements"),
        ", choisir votre séance puis accéder à ",
        prog("l’espace de réservation"),
        " pour finaliser votre achat. Vos billets sont disponibles immédiatement après paiement.",
      ],
    ],
  },
  {
    question:
      "Où voir le programme complet des films et événements à Bizerte ?",
    answer: [
      [
        "Le programme est mis à jour en temps réel avec toutes les séances disponibles. Vous pouvez consulter les films, spectacles et événements directement sur la page ",
        prog("programme du Majestic"),
        " et accéder aux prochaines dates.",
      ],
    ],
  },
  {
    question: "Peut-on réserver ses billets de cinéma en ligne à Bizerte ?",
    answer: [
      [
        "Oui, la plateforme du Majestic permet de réserver vos billets en ligne sans déplacement. Une fois votre séance choisie sur le ",
        prog("programme cinéma Bizerte"),
        ", il vous suffit de passer par ",
        prog("réserver votre place en ligne"),
        " pour confirmer votre billet.",
      ],
    ],
  },
  {
    question:
      "Comment acheter un billet pour une séance au Majestic rapidement ?",
    answer: [
      [
        "Le moyen le plus rapide est de passer par la réservation en ligne. Sélectionnez votre séance via le ",
        prog("programme des séances"),
        " puis validez votre billet en quelques clics sur ",
        prog("réserver votre billet"),
        ", sans attente au guichet.",
      ],
    ],
  },
  {
    question: "Est-ce que les billets sont disponibles sur téléphone ?",
    answer: [
      [
        "Oui, après réservation sur ",
        prog("l’espace de réservation en ligne"),
        ", vous recevez un billet digital utilisable directement depuis votre smartphone. Aucun besoin d’impression, le scan se fait à l’entrée.",
      ],
    ],
  },
  {
    question:
      "Quels types d’événements peut-on réserver au Majestic Bizerte ?",
    answer: [
      [
        "Le Majestic propose une programmation complète : films récents, avant-premières, spectacles, projections spéciales et événements culturels. Retrouvez toutes les séances disponibles sur le ",
        prog("programme des événements à Bizerte"),
        ".",
      ],
    ],
  },
  {
    question:
      "Peut-on réserver plusieurs places pour un événement ou une séance ?",
    answer: [
      [
        "Oui, lors de votre réservation via ",
        prog("réserver plusieurs billets en ligne"),
        ", vous pouvez sélectionner plusieurs places en une seule commande pour assister à un événement en groupe.",
      ],
    ],
  },
  {
    question: "Est-il possible d’éviter l’attente au guichet ?",
    answer: [
      [
        "Oui, la réservation en ligne permet d’éviter totalement l’attente. Consultez le ",
        prog("programme du cinéma Majestic"),
        ", choisissez votre séance et accédez directement à la salle avec votre billet digital après passage sur ",
        prog("réserver votre accès"),
        ".",
      ],
    ],
  },
  {
    question: "Comment savoir si une séance est encore disponible ?",
    answer: [
      [
        "Les disponibilités sont mises à jour automatiquement. Consultez le ",
        prog("programme en temps réel"),
        " pour voir les séances ouvertes et réservez immédiatement via ",
        prog("réserver votre place"),
        " avant qu’elles ne soient complètes.",
      ],
    ],
  },
  {
    question:
      "Le site du Majestic fonctionne-t-il sur mobile pour réserver facilement ?",
    answer: [
      [
        "Oui, la plateforme est entièrement optimisée mobile. Vous pouvez consulter le ",
        prog("programme sur mobile"),
        " et réserver via ",
        prog("l’espace de réservation sécurisé"),
        " en quelques secondes.",
      ],
    ],
  },
  {
    question:
      "Peut-on réserver pour des événements spéciaux ou des projections uniques ?",
    answer: [
      [
        "Oui, les événements spéciaux sont accessibles comme les séances classiques. Il suffit de vérifier leur disponibilité sur le ",
        prog("programme des événements spéciaux"),
        " puis de réserver via ",
        prog("réserver votre billet en ligne"),
        ".",
      ],
    ],
  },
  {
    question: "Pourquoi réserver ses billets en ligne plutôt que sur place ?",
    answer: [
      [
        "Réserver en ligne vous garantit votre place, évite l’attente et vous permet d’accéder rapidement à la salle. Consultez le ",
        prog("programme complet"),
        " puis finalisez votre réservation sur ",
        prog("réserver maintenant"),
        " pour une expérience fluide et sécurisée.",
      ],
    ],
  },
];
