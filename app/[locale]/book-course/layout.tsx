import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurs buchen - Sponk Keramik Düsseldorf",
  description:
    "Buchen Sie einen Kurs bei Sponk Keramik. Wählen Sie aus verfügbaren Terminen für Keramik bemalen und Töpferkurse.",
  keywords: [
    "Keramik Kurs buchen",
    "Töpferkurs Termin",
    "Keramik Workshop buchen Düsseldorf",
    "Online Buchung Keramik",
  ],
  openGraph: {
    title: "Kurs buchen - Sponk Keramik Düsseldorf",
    description:
      "Buchen Sie einen Kurs bei Sponk Keramik. Wählen Sie aus verfügbaren Terminen.",
    url: "https://www.sponkkeramik.de/book-course",
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de/book-course",
  },
};

export default function BookCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}






