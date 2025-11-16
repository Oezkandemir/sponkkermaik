import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie Kurswerke - Kreationen unserer Teilnehmer",
  description:
    "Bewundern Sie die kreativen Werke unserer Kursteilnehmer: Bemalte Keramik, getöpferte Stücke und einzigartige Kunstwerke aus den Workshops von Sponk Keramik Düsseldorf.",
  keywords: [
    "Kurswerke Galerie",
    "Keramik Teilnehmer Werke",
    "Workshop Ergebnisse",
    "Keramik Beispiele",
    "Inspiration Keramik",
  ],
  openGraph: {
    title: "Galerie Kurswerke - Sponk Keramik Düsseldorf",
    description:
      "Bewundern Sie die kreativen Werke unserer Kursteilnehmer: Bemalte Keramik, getöpferte Stücke und mehr.",
    url: "https://www.sponkkeramik.de/galerie-kurswerke",
    images: [
      {
        url: "/images/kurswerke/IMG_4081.jpeg",
        width: 1200,
        height: 630,
        alt: "Galerie Kurswerke Sponk Keramik",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/galerie-kurswerke",
  },
};

export default function GalerieKurswerkeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

