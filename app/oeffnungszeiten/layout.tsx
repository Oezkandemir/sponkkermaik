import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Öffnungszeiten - Atelier & Kurszeiten",
  description:
    "Öffnungszeiten von Sponk Keramik in Düsseldorf: Atelier-Zeiten zum freien Arbeiten und Kurszeiten für Workshops. Vereinbaren Sie einen Termin für Ihre kreative Auszeit.",
  keywords: [
    "Öffnungszeiten Sponk Keramik",
    "Atelier Düsseldorf Öffnungszeiten",
    "Kurszeiten Töpferkurs",
    "Keramik Workshop Zeiten",
    "Atelier besuchen Düsseldorf",
  ],
  openGraph: {
    title: "Öffnungszeiten - Sponk Keramik Düsseldorf",
    description:
      "Besuchen Sie uns: Atelier-Zeiten zum freien Arbeiten und Kurszeiten für Workshops. Vereinbaren Sie einen Termin!",
    url: "https://www.sponkkeramik.de/oeffnungszeiten",
    images: [
      {
        url: "/images/atelier/MG_0176-1-1024x683.webp",
        width: 1200,
        height: 630,
        alt: "Sponk Keramik Atelier Öffnungszeiten",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/oeffnungszeiten",
  },
};

export default function OeffnungszeitenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

