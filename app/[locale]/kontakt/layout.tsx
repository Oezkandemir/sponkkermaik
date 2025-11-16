import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt - Sponk Keramik Düsseldorf",
  description:
    "Kontaktieren Sie Sponk Keramik in Düsseldorf: Fürstenpl. 15, 40215 Düsseldorf. Buchen Sie Ihren Keramik Workshop oder stellen Sie Ihre Fragen. Wir freuen uns auf Ihre Nachricht!",
  keywords: [
    "Kontakt Sponk Keramik",
    "Keramik Atelier Düsseldorf Kontakt",
    "Töpferkurs buchen Düsseldorf",
    "Keramik Workshop anfragen",
    "Fürstenplatz Düsseldorf",
  ],
  openGraph: {
    title: "Kontakt - Sponk Keramik Düsseldorf",
    description:
      "Kontaktieren Sie uns für Keramik Workshops und Töpferkurse in Düsseldorf. Fürstenpl. 15, 40215 Düsseldorf.",
    url: "https://www.sponkkeramik.de/kontakt",
    images: [
      {
        url: "/images/maps-bild.webp",
        width: 1200,
        height: 630,
        alt: "Sponk Keramik Düsseldorf Kontakt",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/kontakt",
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

