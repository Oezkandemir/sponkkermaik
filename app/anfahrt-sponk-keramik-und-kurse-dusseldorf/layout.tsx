import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anfahrt Sponk Keramik Düsseldorf - Wegbeschreibung & Parken",
  description:
    "Anfahrt zu Sponk Keramik Düsseldorf: Fürstenpl. 15, 40215 Düsseldorf. Mit Auto, Bus & Bahn gut erreichbar. Parkhaus Creative Center in der Nähe. Google Maps & Route.",
  keywords: [
    "Anfahrt Sponk Keramik Düsseldorf",
    "Wegbeschreibung Keramik Atelier",
    "Parken Fürstenplatz Düsseldorf",
    "Anreise Töpferkurs",
    "Düsseldorf Keramik Lage",
  ],
  openGraph: {
    title: "Anfahrt Sponk Keramik Düsseldorf - So finden Sie uns",
    description:
      "So finden Sie uns: Fürstenpl. 15, 40215 Düsseldorf. Mit Auto, Bus & Bahn gut erreichbar. Parkhaus in der Nähe.",
    url: "https://www.sponkkeramik.de/anfahrt-sponk-keramik-und-kurse-dusseldorf",
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
    canonical: "https://www.sponkkeramik.de/anfahrt-sponk-keramik-und-kurse-dusseldorf",
  },
};

export default function AnfahrtSponkKeramikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

