import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/app/LenisProvider";
import SiteChrome from "@/components/layout/SiteChrome";
import { houseOfDiamsWordmarkFont, loaderWordmarkFont } from "@/app/fonts";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CartProvider } from "@/lib/hooks/useCart";
import { WishlistProvider } from "@/lib/hooks/useWishlistStore";

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
  title: {
    default: "House of Diams",
    template: "%s | House of Diams",
  },
  description: "Luxury diamond jewellery, crafted in Surat, India.",
  icons: {
    icon: "/house-of-diams-favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${houseOfDiamsWordmarkFont.variable} ${loaderWordmarkFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LenisProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <CartProvider>
                <SiteChrome>{children}</SiteChrome>
              </CartProvider>
            </CurrencyProvider>
          </WishlistProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
