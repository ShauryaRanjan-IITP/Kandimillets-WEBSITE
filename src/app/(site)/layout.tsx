import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCTA from "@/components/layout/FloatingCTA";
import siteConfig from "@/data/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.seo.domain),
  title: {
    template: siteConfig.seo.titleTemplate,
    default: siteConfig.seo.defaultTitle,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: [
    "Makhana",
    "Madhubani Makhana",
    "Healthy Foods",
    "Millet Products",
    "Ragi Semiya",
    "Jowar Pasta",
    "Retail Food Distribution",
    "Healthy Food Products India",
    "Fox Nuts",
    "Sattu",
    "Kandimillets",
  ],
  authors: [{ name: "Kandimillets" }],
  creator: "Kandimillets",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.brand.name,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
