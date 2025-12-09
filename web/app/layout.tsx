import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hangovershield.co"),
  title: {
    default: "Hangover Recovery App | Cure Hangover Fast & Reduce Anxiety",
    template: "%s | Hangover Shield",
  },
  description:
    "Cure hangover fast with Hangover Shield. Personalized hangover recovery plan to reduce anxiety, nausea, and fatigue. Time-blocked recovery app based on real science.",
  keywords: [
    "hangover recovery app",
    "cure hangover fast",
    "hangover plan",
    "hangover anxiety",
    "how to stop hangover nausea",
    "personalized hangover cure",
    "morning-after recovery",
    "time-blocked recovery plan",
    "hangover recovery",
    "hangxiety",
    "hydration",
    "stomach stability",
    "anxiety relief",
    "sleep recovery",
  ],
  authors: [{ name: "Hangover Shield" }],
  creator: "Hangover Shield",
  publisher: "Hangover Shield",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hangovershield.co",
    siteName: "Hangover Shield",
    title: "Hangover Recovery App | Cure Hangover Fast & Reduce Anxiety",
    description:
      "Cure hangover fast with Hangover Shield. Personalized hangover recovery plan to reduce anxiety, nausea, and fatigue. Time-blocked recovery app based on real science.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hangover Shield - Hangover Recovery App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hangover Recovery App | Cure Hangover Fast & Reduce Anxiety",
    description:
      "Cure hangover fast with personalized recovery plan. Reduce hangover anxiety, nausea, and fatigue.",
    images: ["/og-image.jpg"],
    creator: "@hangovershield",
  },
  alternates: {
    canonical: "https://hangovershield.co",
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "your-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  themeColor: "#0F3F46",
};

// Structured Data JSON-LD
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://hangovershield.co/#website",
      "url": "https://hangovershield.co",
      "name": "Hangover Shield",
      "description":
        "Hangover recovery app that provides personalized, time-blocked recovery plans to cure hangover fast and reduce anxiety.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://hangovershield.co/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://hangovershield.co/#organization",
      "name": "Hangover Shield",
      "url": "https://hangovershield.co",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hangovershield.co/logo.png",
        "width": 512,
        "height": 512,
      },
      "sameAs": [
        "https://twitter.com/hangovershield",
        "https://facebook.com/hangovershield",
        "https://instagram.com/hangovershield",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@hangovershield.co",
        "contactType": "Customer Support",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://hangovershield.co/#product",
      "name": "Hangover Shield",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1247",
        "bestRating": "5",
        "worstRating": "1",
      },
      "description":
        "Personalized hangover recovery app that creates time-blocked plans based on your symptoms, sleep quality, and daily schedule. Helps cure hangover fast, reduce anxiety, and recover your day.",
      "screenshot": "https://hangovershield.co/app-screenshot.jpg",
      "featureList": [
        "Personalized recovery plans",
        "Time-blocked recovery schedule",
        "Hangover anxiety management",
        "Hydration tracking",
        "Sleep recovery guidance",
        "Stomach stability tips",
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What helps a hangover instantly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Hydration is key. Start with water and electrolytes immediately. Hangover Shield creates a personalized recovery plan that includes hydration, light nutrition, and gentle movement based on your specific symptoms and schedule.",
          },
        },
        {
          "@type": "Question",
          "name": "Does anxiety get worse during a hangover?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, hangover anxiety (hangxiety) is common. Alcohol affects neurotransmitters, leading to increased anxiety. Hangover Shield addresses this with breathing exercises, grounding techniques, and personalized messages that normalize what you're feeling.",
          },
        },
        {
          "@type": "Question",
          "name": "How does Hangover Shield personalize recovery?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Hangover Shield asks about your symptoms, sleep quality, anxiety levels, and daily schedule. Using this information, it generates a time-blocked recovery plan tailored to your specific needs, ensuring you can recover without disrupting your day.",
          },
        },
        {
          "@type": "Question",
          "name": "How to stop hangover nausea?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Gentle hydration, light bland foods, and avoiding triggers help. Hangover Shield's personalized plan includes specific timing for meals and hydration to stabilize your stomach based on your symptoms.",
          },
        },
        {
          "@type": "Question",
          "name": "What causes a hangover?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Hangovers are caused by dehydration, inflammation, disrupted sleep, and alcohol's effect on neurotransmitters. Hangover Shield addresses all these factors with a science-based recovery protocol.",
          },
        },
        {
          "@type": "Question",
          "name": "Is Hangover Shield free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, Hangover Shield is free to download. The app provides personalized recovery plans based on real recovery science, with no magic pills or gimmicks.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://hangovershield.co" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0F3F46" />
        <meta name="msapplication-TileColor" content="#0F3F46" />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://randomuser.me" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${plusJakarta.variable} ${inter.variable} bg-gradient-hero antialiased`}>
        {children}
      </body>
    </html>
  );
}
