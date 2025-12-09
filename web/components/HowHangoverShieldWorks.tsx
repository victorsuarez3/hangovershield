"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Sparkles, Sunrise } from "lucide-react";

export default function HowHangoverShieldWorks() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] // Apple-like easing
      },
    },
  };

  const steps = [
    {
      title: "Check In",
      description: "Tell us how you feel, your sleep, anxiety, and what your day looks like.",
      Icon: ClipboardCheck,
    },
    {
      title: "Smart Plan Generated",
      description: "You instantly get a personalized, time-blocked recovery plan based on your real symptoms.",
      Icon: Sparkles,
    },
    {
      title: "Recover Better",
      description: "Follow your plan step-by-step and feel better faster, without guesswork.",
      Icon: Sunrise,
    },
  ];

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        paddingTop: '6rem', 
        paddingBottom: '6rem' 
      }}
    >
      {/* Background accent - más suave para mejor legibilidad */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-serenity-mint opacity-6 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-soft-sky-blue opacity-5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-serenity-mint/5 to-soft-sky-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container-max-lg relative z-10">
        <div className="max-w-[1120px] mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Title */}
            <motion.h2 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-bold text-text-dark font-display leading-[1.08] mx-auto"
              style={{ 
                marginBottom: '0',
                letterSpacing: '-0.03em',
                fontWeight: '700',
                maxWidth: '720px',
                width: '100%'
              }}
            >
              How Hangover Shield Works
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-lg text-center mx-auto leading-relaxed"
              style={{ 
                marginTop: '1.5rem',
                marginBottom: '0',
                lineHeight: '1.75',
                letterSpacing: '-0.015em',
                fontWeight: '400',
                maxWidth: '640px',
                width: '100%',
                color: 'rgb(106 106 109)'
              }}
            >
              A simple, intelligent system designed to get you back to your best.
            </motion.p>

            {/* Steps grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full"
              style={{ marginTop: '4rem' }}
            >
              {steps.map((step, idx) => {
                const Icon = step.Icon;
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -4,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="group w-full h-full flex"
                  >
                    <div 
                      className="rounded-3xl border border-white/40 bg-white/45 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] w-full h-full"
                      style={{
                        padding: '2rem',
                        boxShadow: '0 1px 24px rgba(0, 0, 0, 0.03)',
                        WebkitBackdropFilter: 'blur(24px)'
                      }}
                    >
                      {/* Top section: Icon + Title */}
                      <div className="flex flex-col items-center text-center">
                        {/* Icon - centrado */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-teal/15 to-deep-teal/10 flex items-center justify-center mb-5 group-hover:from-deep-teal/20 group-hover:to-deep-teal/15 transition-all duration-300 flex-shrink-0">
                          <Icon size={24} className="text-deep-teal" strokeWidth={2.5} />
                        </div>

                        {/* Title */}
                        <h3 
                          className="text-2xl font-bold text-text-dark font-display leading-tight mb-4"
                          style={{ 
                            letterSpacing: '-0.01em',
                            lineHeight: '1.3'
                          }}
                        >
                          {step.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p 
                        className="text-base text-text-body leading-relaxed flex-1 text-center"
                        style={{ 
                          lineHeight: '1.75',
                          letterSpacing: '-0.01em',
                          fontWeight: '400',
                          color: 'rgb(106 106 109)'
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
