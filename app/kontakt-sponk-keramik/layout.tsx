import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt Sponk Keramik - Jetzt Workshop buchen",
  description:
    "Kontaktieren Sie Sponk Keramik in Düsseldorf: Fürstenpl. 15, 40215 Düsseldorf. Buchen Sie Ihren Keramik Workshop oder Töpferkurs. E-Mail, Telefon, Anfahrt & mehr.",
  keywords: [
    "Kontakt Sponk Keramik",
    "Workshop buchen Düsseldorf",
    "Töpferkurs anfragen",
    "Keramik Atelier Kontakt",
    "Fürstenplatz 15 Düsseldorf",
  ],
  openGraph: {
    title: "Kontakt Sponk Keramik Düsseldorf - Jetzt Workshop buchen",
    description:
      "Kontaktieren Sie uns für Keramik Workshops: Fürstenpl. 15, 40215 Düsseldorf. Jetzt Termin vereinbaren!",
    url: "https://www.sponkkeramik.de/kontakt-sponk-keramik",
    images: [
      {
        url: "/images/maps-bild.webp",
        width: 1200,
        height: 630,
        alt: "Kontakt Sponk Keramik Düsseldorf",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/kontakt-sponk-keramik",
  },
};

export default function KontaktSponkKeramikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

