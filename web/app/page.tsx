import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import HumanTouch from "@/components/HumanTouch";
import IntelligentPlan from "@/components/IntelligentPlan";
import WhyItWorks from "@/components/WhyItWorks";
import HowHangoverShieldWorks from "@/components/HowHangoverShieldWorks";
import Testimonials from "@/components/Testimonials";
import DownloadSection from "@/components/DownloadSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-hero">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <HumanTouch />
      <IntelligentPlan />
      <WhyItWorks />
      <HowHangoverShieldWorks />
      <Testimonials />
      <DownloadSection />
      <Footer />
    </main>
  );
}
