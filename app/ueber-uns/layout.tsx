import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns - Sponk Keramik & Kurse Düsseldorf",
  description:
    "Erfahren Sie mehr über Sponk Keramik & Kurse Düsseldorf: Kreative Auszeit, Keramik bemalen, Töpferkurse und handgefertigte Kunstwerke von Bülent Tepe. Jetzt kennenlernen!",
  keywords: [
    "Über Sponk Keramik",
    "Bülent Tepe Keramiker",
    "Keramik Atelier Geschichte",
    "Töpferei Düsseldorf",
    "Keramik Workshop Düsseldorf",
    "Joseph Beuys Schüler",
  ],
  openGraph: {
    title: "Über uns - Sponk Keramik & Kurse Düsseldorf",
    description:
      "Erfahren Sie mehr über Sponk Keramik: Kreative Auszeit, handgefertigte Kunstwerke und inspirierende Workshops in Düsseldorf.",
    url: "https://www.sponkkeramik.de/ueber-uns",
    images: [
      {
        url: "/images/bernd.webp",
        width: 1200,
        height: 630,
        alt: "Sponk Keramik Atelier Düsseldorf",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/ueber-uns",
  },
};

export default function UeberUnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

