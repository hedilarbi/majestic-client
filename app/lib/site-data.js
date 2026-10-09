export const navLinks = [
  { label: "Films", href: "/evenements?type=movie" },
  { label: "Spectacles", href: "/evenements?type=show" },
  { label: "Programme", href: "/programme" },
  { label: "Offres", href: "/offres" },
  { label: "Actualités", href: "/actualite" },
  { label: "Réserver nos espaces", href: "/reserver-espace" },
];

export const footerLinks = [
  {
    title: "Navigation",
    links: [
      { label: "Films", href: "/evenements?type=movie" },
      { label: "Spectacles", href: "/evenements?type=show" },
      { label: "Programme", href: "/programme" },
      { label: "Offres", href: "/offres" },
      { label: "Actualités", href: "/actualite" },
      { label: "Réserver nos espaces", href: "/reserver-espace" },
      { label: "À propos", href: "/a-propos" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Nous contacter", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Politique de confidentialité", href: "/politique-confidentialite" },
      { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
    ],
  },
];

export const heroCtas = {
  primary: "Réserver maintenant",
  secondary: "Voir les horaires",
};

// Official accounts only (C26): no X/Twitter for now
export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/LeMajesticCentre" },
  { label: "Instagram", href: "https://www.instagram.com/majesticbizerte/" },
];

// Public contact details. Lines stay hidden while a value is empty: never
// publish placeholders (document C25).
export const contactInfo = {
  email: "",
  phone: "",
};
