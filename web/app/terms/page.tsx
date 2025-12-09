import ContactNavbar from "@/components/ContactNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions - Hangover Shield",
  description: "Terms and conditions for Hangover Shield app.",
};

export default function Terms() {
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
              Terms & Conditions
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
                    Acceptance of Terms
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
                    By accessing and using Hangover Shield, you accept and agree to
                    be bound by the terms and provision of this agreement. If you do
                    not agree to abide by the above, please do not use this service.
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
                    License Grant
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
                    Hangover Shield grants you a limited, non-exclusive,
                    non-transferable license to access and use our application for
                    your personal, non-commercial use.
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
                    Prohibited Conduct
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
                    You agree not to use the service in any way that could damage,
                    disable, or impair the application. You also agree not to
                    attempt to gain unauthorized access to any portion of the
                    service.
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
                    Disclaimer of Warranties
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
                    Hangover Shield is provided on an "as is" basis. We make no
                    warranties, express or implied, regarding the service. Use of
                    the service is at your own risk.
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
                    Limitation of Liability
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
                    In no event shall Hangover Shield be liable for any indirect,
                    incidental, special, consequential, or punitive damages arising
                    from your use of the service.
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
                    For any questions regarding these Terms & Conditions, please
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
