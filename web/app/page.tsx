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
import SEOContent from "@/components/SEOContent";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <header role="banner">
        <Navbar />
      </header>
      
      <main id="main-content" role="main" className="min-h-screen bg-gradient-hero">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        
        <section id="problem" aria-label="Problem section">
          <Problem />
        </section>
        
        <section id="how-it-works" aria-label="How it works section">
          <HowItWorks />
        </section>
        
        <section id="human-touch" aria-label="Human touch section">
          <HumanTouch />
        </section>
        
        <section id="smart-plan" aria-label="Smart plan section">
          <IntelligentPlan />
        </section>
        
        <section id="why-it-works" aria-label="Why it works section">
          <WhyItWorks />
        </section>
        
        <section id="how-hangover-shield-works" aria-label="How Hangover Shield works section">
          <HowHangoverShieldWorks />
        </section>
        
        <section id="testimonials" aria-label="Testimonials section">
          <Testimonials />
        </section>
        
        <section id="download" aria-label="Download section">
          <DownloadSection />
        </section>
        
        <section id="seo-content" aria-label="SEO content and FAQ section">
          <SEOContent />
        </section>
      </main>
      
      <footer role="contentinfo">
        <Footer />
      </footer>
    </>
  );
}
