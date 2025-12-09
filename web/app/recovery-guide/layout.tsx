import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hangover Recovery Guide | How to Cure Hangover Fast & Reduce Anxiety",
  description:
    "Learn how to cure hangover fast with our comprehensive recovery guide. Understand what causes hangovers, how to stop hangover nausea, and manage hangover anxiety. Expert tips for personalized hangover recovery.",
  keywords: [
    "how to cure hangover fast",
    "hangover recovery guide",
    "hangover anxiety",
    "how to stop hangover nausea",
    "what causes a hangover",
    "hangover recovery plan",
    "personalized hangover cure",
    "morning-after recovery",
  ],
  openGraph: {
    title: "Hangover Recovery Guide | How to Cure Hangover Fast",
    description:
      "Learn how to cure hangover fast and reduce anxiety. Expert guide on hangover recovery, personalized plans, and science-based tips.",
    type: "article",
    url: "https://hangovershield.co/recovery-guide",
  },
  alternates: {
    canonical: "https://hangovershield.co/recovery-guide",
  },
};

export default function RecoveryGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

