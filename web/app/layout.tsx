import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hangover Shield - Recover Faster, Feel Better",
  description:
    "Intelligent protocol to prevent hangover, manage hangxiety, and recover your day. Before, during, and after drinking.",
  keywords: [
    "hangover relief",
    "hangxiety",
    "recovery protocol",
    "wellness app",
    "health",
  ],
  openGraph: {
    title: "Hangover Shield - Recover Faster, Feel Better",
    description:
      "Intelligent protocol to prevent hangover, manage hangxiety, and recover your day.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#0F3F46",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0F3F46" />
      </head>
      <body className={`${plusJakarta.variable} ${inter.variable} bg-gradient-hero antialiased`}>{children}</body>
    </html>
  );
}
