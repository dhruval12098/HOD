import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/app/LenisProvider";
import SiteChrome from "@/components/layout/SiteChrome";
import { houseOfDiamsWordmarkFont, loaderWordmarkFont } from "@/app/fonts";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CartProvider } from "@/lib/hooks/useCart";
import { WishlistProvider } from "@/lib/hooks/useWishlistStore";
import { getSiteUrl } from "@/lib/site-url";
import JsonLd from "@/components/seo/JsonLd";
import { createOrganizationSchema } from "@/lib/structured-data";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MaintenanceScreen from "@/components/layout/MaintenanceScreen";
import { getMaintenanceMode } from "@/lib/maintenance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "House of Diams",
    template: "%s | House of Diams",
  },
  description: "Luxury diamond jewellery, crafted in Surat, India.",
  icons: {
    icon: "/house-of-diams-favicon.ico",
  },
  verification: {
    other: {
      'msvalidate.01': '4B163F684E5979CF3BB4A6CE96FA16F8',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenanceMode = await getMaintenanceMode()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${houseOfDiamsWordmarkFont.variable} ${loaderWordmarkFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <JsonLd data={createOrganizationSchema()} />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {maintenanceMode.enabled ? (
          <MaintenanceScreen message={maintenanceMode.message} />
        ) : (
          <LenisProvider>
            <WishlistProvider>
              <CurrencyProvider>
                <CartProvider>
                  <SiteChrome>{children}</SiteChrome>
                </CartProvider>
              </CurrencyProvider>
            </WishlistProvider>
          </LenisProvider>
        )}
      </body>
    </html>
  );
}
