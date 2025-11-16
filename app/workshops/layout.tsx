import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshops & Preise - Keramik bemalen & Töpferkurse",
  description:
    "Entdecken Sie unsere vielfältigen Keramik-Workshops in Düsseldorf: Keramik bemalen, Töpferkurse an der Drehscheibe, Kindergeburtstage und mehr. Jetzt online buchen!",
  keywords: [
    "Keramik Workshop Düsseldorf",
    "Töpferkurs Preise",
    "Keramik bemalen buchen",
    "Pottery Workshop Düsseldorf",
    "Töpfern lernen",
    "Keramik Kurs Anfänger",
    "Kindergeburtstag Keramik",
    "Töpferscheibe Workshop",
  ],
  openGraph: {
    title: "Workshops & Preise - Sponk Keramik Düsseldorf",
    description:
      "Entdecken Sie unsere vielfältigen Keramik-Workshops: Keramik bemalen, Töpferkurse, Kindergeburtstage und mehr. Jetzt online buchen!",
    url: "https://www.sponkkeramik.de/workshops",
    images: [
      {
        url: "/images/workshops/IMG_3294.webp",
        width: 1200,
        height: 630,
        alt: "Keramik Workshop bei Sponk Keramik",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/workshops",
  },
};

export default function WorkshopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

