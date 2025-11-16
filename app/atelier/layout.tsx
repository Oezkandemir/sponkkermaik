import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Galerie - Handgefertigte Keramikkunst",
  description:
    "Entdecken Sie handgefertigte Keramikkunstwerke von Bülent Tepe im Atelier Sponk Keramik Düsseldorf. Jedes Stück ein Unikat mit Liebe zum Detail gefertigt.",
  keywords: [
    "Keramikkunst Düsseldorf",
    "Handgemachte Keramik",
    "Bülent Tepe Künstler",
    "Keramik Galerie Düsseldorf",
    "Unikat Keramik kaufen",
    "Atelier Keramik",
  ],
  openGraph: {
    title: "Atelier Galerie - Handgefertigte Keramikkunst",
    description:
      "Entdecken Sie handgefertigte Keramikkunstwerke von Bülent Tepe. Jedes Stück ein Unikat mit Liebe zum Detail.",
    url: "https://www.sponkkeramik.de/atelier",
    images: [
      {
        url: "/images/atelier/IMG_5264-1152x1536.webp",
        width: 1200,
        height: 630,
        alt: "Handgefertigte Keramikkunst Atelier Düsseldorf",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/atelier",
  },
};

export default function AtelierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

