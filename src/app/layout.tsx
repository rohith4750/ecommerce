import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import StoreLayoutWrapper from "@/components/shared/StoreLayoutWrapper";
import Toast from "@/components/shared/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "SilkRoute | Premium Ethnic Wear E-Commerce Store",
  description:
    "Explore SilkRoute's curated collection of premium ethnic wear, including kurtas, lehengas, and punjabi dresses. Luxury meets heritage. Delivered worldwide.",
  keywords: "ethnic wear, kurtas, lehengas, punjabi dresses, designer ethnic wear, indian traditional wear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FCFAFD] text-[#1A1A2E] font-sans antialiased">
        <StoreLayoutWrapper>
          {children}
        </StoreLayoutWrapper>
        <Toast />
      </body>
    </html>
  );
}
