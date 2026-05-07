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
  metadataBase: new URL("https://fabrick-sustainability-hub.vercel.app"),
  title: "Live UK Construction Data and Open Tools | Fabrick",
  description:
    "Live UK grid carbon, material prices, planning, ONS output and EPC data. Free embodied carbon calculator and a timeline of upcoming UK construction regulations.",
  keywords: [
    "UK construction data",
    "embodied carbon calculator",
    "future homes standard",
    "UK building regulations",
    "UK grid carbon intensity",
    "UK construction material prices",
    "UK planning applications",
    "UK EPC data",
    "Part Z embodied carbon",
  ],
  openGraph: {
    title: "Live UK Construction Data and Open Tools | Fabrick",
    description:
      "Live UK grid carbon, material prices, planning, ONS output and EPC data. Free embodied carbon calculator and the UK regulations timeline.",
    url: "https://fabrick-sustainability-hub.vercel.app",
    siteName: "Fabrick Built Environment Data",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fabrick Built Environment Data - Live UK Construction Data Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live UK Construction Data and Open Tools | Fabrick",
    description:
      "Live UK grid carbon, material prices, planning, ONS output and EPC data. Free embodied carbon calculator and the UK regulations timeline.",
    images: ["/og-image.png"],
    creator: "@FabrickAgency",
  },
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
