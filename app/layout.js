import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import "./globals.css";

export const metadata = {
  title: "Majestic",
  description:
    "Plongez dans les derniers blockbusters avec une expérience cinéma premium.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Majestic",
    description:
      "Plongez dans les derniers blockbusters avec une expérience cinéma premium.",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Lumière Cinéma",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Majestic",
    description:
      "Plongez dans les derniers blockbusters avec une expérience cinéma premium.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen overflow-x-hidden bg-black antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
