import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ChatbaseWidget from "@/components/ChatbaseWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sponkkeramik.de'),
  title: {
    default: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
    template: "%s | Sponk Keramik Düsseldorf",
  },
  description:
    "Sponk Keramik bietet Keramik bemalen, Töpferkurse und handgefertigte Keramikkunst in Düsseldorf. Workshops für Anfänger und Fortgeschrittene. Jetzt online buchen!",
  keywords: [
    "Keramik bemalen Düsseldorf",
    "Töpferkurs Düsseldorf",
    "Keramik Workshop Düsseldorf",
    "Keramik Kurse",
    "Töpfern lernen",
    "Handgefertigte Keramik",
    "Bülent Tepe",
    "Keramik Atelier",
    "Kreativkurs Düsseldorf",
    "Pottery Workshop",
    "Keramik malen",
  ],
  authors: [{ name: "Sponk Keramik" }],
  creator: "Sponk Keramik",
  publisher: "Sponk Keramik",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://www.sponkkeramik.de",
    siteName: "Sponk Keramik Düsseldorf",
    title: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
    description:
      "Sponk Keramik bietet Keramik bemalen, Töpferkurse und handgefertigte Keramikkunst in Düsseldorf. Workshops für Anfänger und Fortgeschrittene.",
    images: [
      {
        url: "/images/sponkkeramik.webp",
        width: 1200,
        height: 630,
        alt: "Sponk Keramik Atelier Düsseldorf",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
    description:
      "Sponk Keramik bietet Keramik bemalen, Töpferkurse und handgefertigte Keramikkunst in Düsseldorf. Workshops für Anfänger und Fortgeschrittene.",
    images: ["/images/sponkkeramik.webp"],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  verification: {
    google: 'google-site-verification-code', // Später mit echtem Code ersetzen
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{ marginTop: '0', paddingTop: '0' }}
      >
        <Header />
        <main className="grow pt-8 md:pt-12">{children}</main>
        <Footer />
        <ScrollToTopButton />
        <ChatbaseWidget />
      </body>
    </html>
  );
}
