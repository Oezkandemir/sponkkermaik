import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter abmelden - Sponk Keramik",
  description: "Melden Sie sich vom Newsletter ab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewsletterUnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}






