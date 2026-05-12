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
  metadataBase: new URL("https://pulse.fabrick.agency"),
  title: "Pulse by Fabrick — live UK built environment data and tools",
  description:
    "Pulse by Fabrick: real UK planning activity, material prices, grid carbon, ONS construction output and EPC data. Free embodied carbon calculator and the UK regulations timeline.",
  keywords: [
    "Pulse by Fabrick",
    "UK construction data",
    "UK planning intelligence",
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
    title: "Pulse by Fabrick — live UK built environment data and tools",
    description:
      "Pulse by Fabrick: real UK planning activity, material prices, grid carbon, ONS construction output and EPC data. Free embodied carbon calculator and the UK regulations timeline.",
    url: "https://pulse.fabrick.agency",
    siteName: "Pulse by Fabrick",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulse by Fabrick — live UK built environment data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse by Fabrick — live UK built environment data and tools",
    description:
      "Pulse by Fabrick: real UK planning activity, material prices, grid carbon, ONS construction output and EPC data. Free embodied carbon calculator and the UK regulations timeline.",
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
