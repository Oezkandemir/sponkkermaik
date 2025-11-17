import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ChatbaseWidget from "@/components/ChatbaseWidget";
import SnowfallEffect from "@/components/Snowfall";
import SantaAnimation from "@/components/SantaAnimation";
import { locales } from '@/i18n';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sponkkeramik.de'),
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{ marginTop: '0', paddingTop: '0' }}
      >
        <NextIntlClientProvider messages={messages}>
          <SnowfallEffect />
          <SantaAnimation />
          <Header />
          <main className="grow pt-20 md:pt-16">{children}</main>
          <Footer />
          <ScrollToTopButton />
          <ChatbaseWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

