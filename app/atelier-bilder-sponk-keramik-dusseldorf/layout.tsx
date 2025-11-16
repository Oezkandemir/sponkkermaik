import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Bilder - Einblicke in unsere Keramikwerkstatt",
  description:
    "Sehen Sie Bilder aus unserem Keramik Atelier in Düsseldorf: Werkstatt, Brennofen, Töpferscheiben und unsere kreativen Räume. Gewinnen Sie einen Einblick in Sponk Keramik.",
  keywords: [
    "Atelier Bilder Sponk Keramik",
    "Keramikwerkstatt Düsseldorf",
    "Töpferei Bilder",
    "Keramik Atelier Fotos",
    "Werkstatt Impressionen",
  ],
  openGraph: {
    title: "Atelier Bilder - Sponk Keramik Düsseldorf",
    description:
      "Sehen Sie Bilder aus unserem Keramik Atelier: Werkstatt, Brennofen, Töpferscheiben und kreative Räume.",
    url: "https://www.sponkkeramik.de/atelier-bilder-sponk-keramik-dusseldorf",
    images: [
      {
        url: "/images/atelier/IMG_6970-1536x2048.webp",
        width: 1200,
        height: 630,
        alt: "Atelier Bilder Sponk Keramik Düsseldorf",
      },
    ],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/atelier-bilder-sponk-keramik-dusseldorf",
  },
};

export default function AtelierBilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

