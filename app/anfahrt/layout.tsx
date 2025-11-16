import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anfahrt - So finden Sie uns in Düsseldorf",
  description:
    "Anfahrt zu Sponk Keramik in Düsseldorf: Fürstenpl. 15, 40215 Düsseldorf. Mit Auto, Bus & Bahn gut erreichbar. Parkhaus in unmittelbarer Nähe. Routenplaner & Karte.",
  keywords: [
    "Anfahrt Sponk Keramik",
    "Sponk Keramik Düsseldorf Adresse",
    "Keramik Atelier Fürstenplatz",
    "Parken Düsseldorf Innenstadt",
    "Öffentliche Verkehrsmittel Düsseldorf",
  ],
  openGraph: {
    title: "Anfahrt - Sponk Keramik Düsseldorf",
    description:
      "So finden Sie uns: Fürstenpl. 15, 40215 Düsseldorf. Mit Auto, Bus & Bahn gut erreichbar. Parkhaus in der Nähe.",
    url: "https://www.sponkkeramik.de/anfahrt",
    images: [
      {
        url: "/images/maps-bild.webp",
        width: 1200,
        height: 630,
        alt: "Anfahrt Sponk Keramik Düsseldorf",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/anfahrt",
  },
};

export default function AnfahrtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

