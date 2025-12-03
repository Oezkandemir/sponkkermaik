import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Sponk Keramik",
  description: "Admin dashboard for managing course schedules",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}








