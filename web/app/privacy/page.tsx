import ContactNavbar from "@/components/ContactNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy - Hangover Shield",
  description: "Privacy policy for Hangover Shield app.",
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-gradient-hero">
      <ContactNavbar />
      <section 
        className="relative overflow-hidden"
        style={{ 
          paddingTop: '8rem', 
          paddingBottom: '6rem' 
        }}
      >
        {/* Background accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-serenity-mint opacity-6 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-soft-sky-blue opacity-5 rounded-full blur-3xl" />
        </div>

        <div className="container-max-lg relative z-10">
          <div className="max-w-4xl mx-auto px-4">
            {/* Title */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-text-dark font-display leading-[1.1] mb-6"
              style={{ 
                letterSpacing: '-0.03em',
                fontWeight: '700'
              }}
            >
              Privacy Policy
            </h1>

            {/* Content card */}
            <div 
              className="glass rounded-3xl shadow-glass"
              style={{
                padding: '3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 18px 45px rgba(15, 63, 70, 0.15), 0 8px 16px rgba(15, 63, 70, 0.08)'
              }}
            >
              <div 
                className="space-y-10"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2.5rem'
                }}
              >
                <section>
                  <h2 
                    className="text-xl md:text-2xl font-bold text-text-dark font-display mb-4"
                    style={{ 
                      letterSpacing: '-0.02em',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      marginBottom: '1rem'
                    }}
                  >
                    Introduction
                  </h2>
                  <p 
                    className="text-text-body leading-relaxed"
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.75',
                      letterSpacing: '-0.01em',
                      fontWeight: '400',
                      color: 'rgb(106 106 109)'
                    }}
                  >
                    Hangover Shield is committed to protecting your privacy. This
                    Privacy Policy explains how we collect, use, disclose, and
                    otherwise process personal information.
                  </p>
                </section>

                <section>
                  <h2 
                    className="text-xl md:text-2xl font-bold text-text-dark font-display mb-4"
                    style={{ 
                      letterSpacing: '-0.02em',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      marginBottom: '1rem'
                    }}
                  >
                    Information We Collect
                  </h2>
                  <p 
                    className="text-text-body leading-relaxed"
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.75',
                      letterSpacing: '-0.01em',
                      fontWeight: '400',
                      color: 'rgb(106 106 109)'
                    }}
                  >
                    We may collect information you provide directly, such as when
                    you create an account, subscribe to our service, or contact us
                    for support. This may include your email address, name, and
                    health-related information you choose to share.
                  </p>
                </section>

                <section>
                  <h2 
                    className="text-xl md:text-2xl font-bold text-text-dark font-display mb-4"
                    style={{ 
                      letterSpacing: '-0.02em',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      marginBottom: '1rem'
                    }}
                  >
                    How We Use Your Information
                  </h2>
                  <p 
                    className="text-text-body leading-relaxed"
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.75',
                      letterSpacing: '-0.01em',
                      fontWeight: '400',
                      color: 'rgb(106 106 109)'
                    }}
                  >
                    We use the information we collect to provide, maintain, and
                    improve our services, process transactions, send informational
                    updates, and respond to your inquiries.
                  </p>
                </section>

                <section>
                  <h2 
                    className="text-xl md:text-2xl font-bold text-text-dark font-display mb-4"
                    style={{ 
                      letterSpacing: '-0.02em',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      marginBottom: '1rem'
                    }}
                  >
                    Data Security
                  </h2>
                  <p 
                    className="text-text-body leading-relaxed"
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.75',
                      letterSpacing: '-0.01em',
                      fontWeight: '400',
                      color: 'rgb(106 106 109)'
                    }}
                  >
                    We implement appropriate technical and organizational security
                    measures to protect your personal information against
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </section>

                <section>
                  <h2 
                    className="text-xl md:text-2xl font-bold text-text-dark font-display mb-4"
                    style={{ 
                      letterSpacing: '-0.02em',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      marginBottom: '1rem'
                    }}
                  >
                    Contact Us
                  </h2>
                  <p 
                    className="text-text-body leading-relaxed"
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.75',
                      letterSpacing: '-0.01em',
                      fontWeight: '400',
                      color: 'rgb(106 106 109)'
                    }}
                  >
                    If you have any questions about this Privacy Policy, please
                    contact us at{" "}
                    <a
                      href="mailto:support@hangovershield.co"
                      className="text-deep-teal font-semibold hover:underline transition-all duration-200"
                      style={{
                        color: 'rgb(15, 63, 70)',
                        fontWeight: '600'
                      }}
                    >
                      support@hangovershield.co
                    </a>
                    .
                  </p>
                </section>

                <section 
                  className="pt-4 border-t border-white/20"
                  style={{
                    paddingTop: '1.5rem',
                    marginTop: '1rem'
                  }}
                >
                  <p 
                    className="text-sm text-text-body"
                    style={{ 
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      letterSpacing: '-0.01em',
                      fontWeight: '400',
                      color: 'rgb(140 140 143)',
                      opacity: 0.8
                    }}
                  >
                    Last updated: {new Date().getFullYear()}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
