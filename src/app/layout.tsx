import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StorageErrorBanner from "@/components/StorageErrorBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Kanban",
  description: "Simple Kanban board for small teams",
  openGraph: {
    title: "Team Kanban",
    description: "Simple Kanban board for small teams",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        {children}
        <StorageErrorBanner />
      </body>
    </html>
  );
}
