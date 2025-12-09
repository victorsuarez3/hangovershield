import { Metadata } from "next";
import ContactNavbar from "@/components/ContactNavbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us | Hangover Shield",
  description:
    "Get in touch with the Hangover Shield team. We're here to help you recover smarter. Email, phone, or fill out our contact form.",
  keywords: ["contact", "support", "hangover relief", "customer service"],
  openGraph: {
    title: "Contact Us | Hangover Shield",
    description:
      "Get in touch with the Hangover Shield team. We're here to help you recover smarter.",
    url: "https://hangovershield.co/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-hero">
      <ContactNavbar />
      <Contact />
      <Footer />
    </main>
  );
}
