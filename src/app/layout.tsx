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

const SITE_TITLE = "Pulse: The Signal Before the Noise | Free UK Construction Data";
const SITE_DESCRIPTION =
  "Pulse is the signal before the noise: making data accessible to the construction industry. Live UK construction data and statistics: planning applications, material prices, grid carbon intensity, ONS construction output and the EPC register, plus a free embodied carbon calculator and the UK regulations timeline.";

export const metadata: Metadata = {
  metadataBase: new URL("https://pulse.fabrick.agency"),
  title: {
    default: SITE_TITLE,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  // Self-referencing canonical on every page (resolved per-route against
  // metadataBase); pages can still override.
  alternates: { canonical: "./" },
  keywords: [
    "Pulse by Fabrick",
    "UK construction data",
    "construction industry data",
    "UK construction statistics",
    "UK planning intelligence",
    "embodied carbon calculator",
    "future homes standard",
    "UK building regulations",
    "UK grid carbon intensity",
    "UK construction material prices",
    "UK planning applications",
    "EPC register",
    "Part Z embodied carbon",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://pulse.fabrick.agency",
    siteName: "Pulse",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulse - the signal before the noise. Live UK built environment data.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@FabrickAgency",
  },
};

// Organization + WebSite structured data, sitewide. Individual pages add
// their own Dataset/FAQPage JSON-LD where relevant.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.fabrick.agency/#organization",
      name: "Fabrick",
      url: "https://www.fabrick.agency",
      description:
        "Fabrick is a UK construction and built environment marketing agency.",
    },
    {
      "@type": "WebSite",
      "@id": "https://pulse.fabrick.agency/#website",
      name: "Pulse",
      alternateName: ["Pulse by Fabrick", "The signal before the noise"],
      url: "https://pulse.fabrick.agency",
      description: SITE_DESCRIPTION,
      publisher: { "@id": "https://www.fabrick.agency/#organization" },
      inLanguage: "en-GB",
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
