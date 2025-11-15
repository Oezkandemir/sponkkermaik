import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
  description:
    "Sponk Keramik bietet Keramik bemalen, Töpferkurse und handgefertigte Keramikkunst in Düsseldorf. Workshops für Anfänger und Fortgeschrittene.",
  keywords: "Keramik, Töpferkurs, Düsseldorf, Keramik bemalen, Workshop, Bülent Tepe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{ marginTop: '0', paddingTop: '0' }}
      >
        <Header />
        <main className="flex-grow pt-8 md:pt-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
