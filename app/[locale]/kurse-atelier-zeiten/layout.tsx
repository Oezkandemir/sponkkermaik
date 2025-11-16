import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurse & Atelier Zeiten - Wann findet was statt?",
  description:
    "Kurszeiten und Atelier-Öffnungszeiten bei Sponk Keramik Düsseldorf: Workshops, Töpferkurse und freies Arbeiten. Finden Sie den passenden Zeitpunkt für Ihre kreative Auszeit.",
  keywords: [
    "Kurszeiten Sponk Keramik",
    "Atelier Zeiten Düsseldorf",
    "Workshop Termine",
    "Töpferkurs Zeiten",
    "Freies Arbeiten Keramik",
  ],
  openGraph: {
    title: "Kurse & Atelier Zeiten - Sponk Keramik Düsseldorf",
    description:
      "Kurszeiten und Atelier-Öffnungszeiten: Workshops, Töpferkurse und freies Arbeiten. Jetzt Termin finden!",
    url: "https://www.sponkkeramik.de/kurse-atelier-zeiten",
    images: [
      {
        url: "/images/atelier/MG_0176-1-1024x683.webp",
        width: 1200,
        height: 630,
        alt: "Kurse und Atelier Zeiten Sponk Keramik",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/kurse-atelier-zeiten",
  },
};

export default function KurseAtelierZeitenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

