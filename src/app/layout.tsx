import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Fabrick Sustainability Hub | UK Construction Carbon Data & Tools",
  description:
    "The UK construction industry's leading sustainability data hub. Live carbon data, material calculators, regulatory intelligence, and practical tools for net-zero construction.",
  keywords: [
    "construction carbon calculator UK",
    "embodied carbon database",
    "Part Z building regulations",
    "Future Homes Standard 2026",
    "whole life carbon assessment",
    "low carbon building materials",
    "construction sustainability",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
