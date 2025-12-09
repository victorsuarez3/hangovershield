"use client";

import { motion } from "framer-motion";
import { Apple, Smartphone } from "lucide-react";

export default function DownloadSection() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section 
      id="download" 
      className="relative overflow-hidden"
      style={{ 
        paddingTop: '7rem', 
        paddingBottom: '7rem' 
      }}
    >
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-soft-sky-blue opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-serenity-mint opacity-5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-deep-teal opacity-3 rounded-full blur-3xl" />
      </div>

      <div className="container-max-lg relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center w-full"
        >
          {/* Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-text-dark font-display leading-[1.1] tracking-tight text-center"
            style={{ 
              marginBottom: '0',
              letterSpacing: '-0.03em',
              fontWeight: '700',
              maxWidth: '800px',
              width: '100%'
            }}
          >
            Wake up with a plan, not a hangover.
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-text-body leading-relaxed text-center mx-auto"
            style={{ 
              marginTop: '1.5rem',
              marginBottom: '0',
              lineHeight: '1.75',
              letterSpacing: '-0.015em',
              fontWeight: '400',
              maxWidth: '680px',
              width: '100%',
              color: 'rgb(106 106 109)'
            }}
          >
            Available now on iOS and Android. Answer a 2-minute check-in and wake up with a recovery plan tailored to your day.
          </motion.p>

          {/* App store buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center w-full"
            style={{ 
              gap: '1.25rem',
              marginTop: '4rem',
              marginBottom: '0'
            }}
          >
            {/* Primary button - App Store */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="rounded-2xl font-bold text-white-pure hover:shadow-glass-lg transition-all duration-300 flex items-center justify-center shadow-lg group relative overflow-hidden w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              style={{
                paddingTop: '1.125rem',
                paddingBottom: '1.125rem',
                paddingLeft: '2.25rem',
                paddingRight: '2.25rem',
                minWidth: '200px',
                background: 'linear-gradient(135deg, rgb(15, 63, 70) 0%, rgb(13, 52, 58) 100%)',
                boxShadow: '0 8px 24px rgba(15, 63, 70, 0.25), 0 4px 8px rgba(15, 63, 70, 0.15)',
                color: 'rgb(255, 255, 255)'
              }}
              aria-label="Download Hangover Shield from App Store - iOS"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Apple size={24} className="relative z-10 text-white" strokeWidth={2.5} aria-hidden="true" />
              <span className="font-display text-lg relative z-10 text-white" style={{ marginLeft: '0.875rem', letterSpacing: '-0.01em', color: 'rgb(255, 255, 255)' }}>App Store</span>
            </motion.a>

            {/* Secondary button - Google Play */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass rounded-2xl font-bold text-text-dark hover:shadow-glass-lg transition-all duration-300 flex items-center justify-center border-2 border-white/60 shadow-glass group relative overflow-hidden w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-deep-teal focus:ring-offset-2"
              style={{
                paddingTop: '1.125rem',
                paddingBottom: '1.125rem',
                paddingLeft: '2.25rem',
                paddingRight: '2.25rem',
                minWidth: '200px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(16px)'
              }}
              aria-label="Download Hangover Shield from Google Play - Android"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-deep-teal/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Smartphone size={24} className="text-deep-teal group-hover:scale-110 transition-transform duration-300 relative z-10" strokeWidth={2.5} aria-hidden="true" />
              <span className="font-display text-lg relative z-10" style={{ marginLeft: '0.875rem', letterSpacing: '-0.01em' }}>Google Play</span>
            </motion.a>
          </motion.div>

          {/* Trust / reassurance line */}
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm text-center mx-auto"
            style={{
              marginTop: '2rem',
              marginBottom: '0',
              color: 'rgb(106 106 109)',
              letterSpacing: '-0.01em',
              fontWeight: '400',
              maxWidth: '600px',
              width: '100%',
              lineHeight: '1.65',
              opacity: 0.75
            }}
          >
            Free to download · No magic pills · Based on real recovery science
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
