import "./globals.css";
import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";
import { BottomTabBar } from "../components/bottom-tab-bar";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { LoginSheet } from "../components/login-sheet";
import { Toaster } from "../components/toaster";
import { CompareSelectionProvider } from "../lib/compareSelection";
import { FloatingCompareBar } from "../components/floating-compare-bar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | PropertiesWale — Verified Homes. Better Decisions.",
    default: "PropertiesWale — Buy Homes from Verified Builders | Flats, Houses, Plots",
  },
  description:
    "Find flats, houses, plots and commercial spaces from verified builders. Transparent pricing, direct contact, no brokers. Browse 100% verified real estate projects across India.",
  keywords: [
    "verified builders",
    "real estate India",
    "buy flat",
    "buy house",
    "buy plot",
    "property for sale",
    "residential projects",
    "commercial property",
    "RERA verified builders",
    "new construction projects",
    "apartments for sale",
    "housing projects",
    "real estate without broker",
    "builder verified properties",
    "property prices",
    "home buying",
    "invest in real estate",
    "under construction projects",
    "ready to move flats",
    "verified real estate platform",
  ],
  authors: [{ name: "PropertiesWale" }],
  creator: "PropertiesWale",
  publisher: "PropertiesWale",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    siteName: "PropertiesWale",
    locale: "en_IN",
    title: "PropertiesWale — Buy Homes from Verified Builders | Flats, Houses, Plots",
    description:
      "Find flats, houses, plots and commercial spaces from verified builders. Transparent pricing, direct contact, no brokers.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "PropertiesWale — Verified Builders, Real Listings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertiesWale — Buy Homes from Verified Builders",
    description:
      "Flats, houses and plots from verified builders. No brokers, transparent pricing.",
    images: ["/og-default.png"],
    creator: "@verifiedprops",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "/",
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
  other: {
    "application-name": "PropertiesWale",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "PropertiesWale",
    "theme-color": "#1B2A4A",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <CompareSelectionProvider>
            <SiteHeader />
            <main className="min-h-screen pb-20 md:pb-0">{children}</main>
            <SiteFooter />
            <Toaster />
            <FloatingCompareBar />
            <BottomTabBar />
            <LoginSheet />
          </CompareSelectionProvider>
        </Providers>
      </body>
    </html>
  );
}
