import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurse & Preise - Keramik Workshops buchen",
  description:
    "Preise für Keramik Workshops bei Sponk Keramik Düsseldorf: Keramik bemalen ab 39€, Töpferkurse, Kindergeburtstage, Gruppenevents. Jetzt online buchen!",
  keywords: [
    "Keramik Preise Düsseldorf",
    "Töpferkurs Kosten",
    "Workshop Preise Keramik",
    "Keramik bemalen Preis",
    "Kurse buchen Düsseldorf",
  ],
  openGraph: {
    title: "Kurse & Preise - Sponk Keramik Düsseldorf",
    description:
      "Preise für Keramik Workshops: Keramik bemalen ab 39€, Töpferkurse, Kindergeburtstage. Jetzt online buchen!",
    url: "https://www.sponkkeramik.de/kurse-preise-sponk-keramik",
    images: [
      {
        url: "/images/workshops/IMG_3294.webp",
        width: 1200,
        height: 630,
        alt: "Kurse und Preise Sponk Keramik Düsseldorf",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/kurse-preise-sponk-keramik",
  },
};

export default function KursePreiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

