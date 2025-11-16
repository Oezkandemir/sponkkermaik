import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum - Rechtliche Angaben",
  description:
    "Impressum von Sponk Keramik Düsseldorf: Rechtliche Angaben gemäß § 5 TMG, Kontaktdaten, Umsatzsteuer-ID und Haftungsausschluss.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/impressum",
  },
};

export default function ImpressumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

