"use client";

import { motion } from "framer-motion";
import { Moon, Wine, Sunrise, Check } from "lucide-react";

export default function HowItWorks() {
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

  const phases = [
    {
      title: "Before Drinking",
      Icon: Moon,
      items: [
        "Suggested limit based on your body & day",
        "Gentle hydration reminders",
        "Smart prep tips for tomorrow",
      ],
    },
    {
      title: "During the Night",
      Icon: Wine,
      items: [
        "Simple drink counter (no judgment)",
        "Nudges to drink water on time",
        "Social Shield mode: block impulsive texts",
      ],
    },
    {
      title: "When You Wake",
      Icon: Sunrise,
      items: [
        "Physical & emotional check-in in 1 min",
        "Real hangxiety management",
        "Smart recovery plan to save your day",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden"
      style={{ 
        paddingTop: '6rem', 
        paddingBottom: '6rem' 
      }}
    >
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-mist opacity-5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-soft-sky-blue opacity-8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-serenity-mint opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="container-max-lg relative z-10">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center w-full"
          >
            {/* Title */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-5xl font-bold text-text-dark text-center font-display leading-[1.08] mx-auto"
              style={{ 
                marginBottom: '0',
                letterSpacing: '-0.03em',
                fontWeight: '700',
                maxWidth: '720px',
                width: '100%'
              }}
            >
              We care for you before, during, and after.
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-lg text-text-body text-center mx-auto"
              style={{ 
                marginTop: '1.5rem',
                marginBottom: '2rem',
                lineHeight: '1.75',
                letterSpacing: '-0.015em',
                fontWeight: '400',
                maxWidth: '620px',
                width: '100%',
                color: 'rgb(106 106 109)'
              }}
            >
              We don't judge. We don't lecture. We just help you feel better,
              faster.
            </motion.p>

            {/* Three columns grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-12 lg:mt-16 mx-auto"
              style={{ maxWidth: '100%', width: '100%' }}
            >
              {phases.map((phase, idx) => {
                const Icon = phase.Icon;
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -4,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="glass-sm rounded-3xl border border-white/20 group cursor-pointer h-full flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      padding: '2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px -8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Top section: Icon + Title */}
                    <div>
                      {/* Icon - small, top left */}
                      <div 
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-teal/15 to-deep-teal/10 flex items-center justify-center flex-shrink-0 mb-4 group-hover:from-deep-teal/20 group-hover:to-deep-teal/15 transition-all duration-300" 
                      >
                        <Icon size={18} className="text-deep-teal" strokeWidth={2.5} />
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-xl font-bold text-text-dark font-display leading-tight"
                        style={{ 
                          marginBottom: '0',
                          letterSpacing: '-0.01em',
                          lineHeight: '1.3'
                        }}
                      >
                        {phase.title}
                      </h3>
                    </div>

                    {/* Bottom section: List items */}
                    <ul 
                      className="flex flex-col mt-6"
                      style={{ gap: '0.875rem' }}
                    >
                      {phase.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-text-body"
                          style={{ 
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          <Check 
                            size={18} 
                            className="text-deep-teal flex-shrink-0" 
                            strokeWidth={2.5}
                            style={{ marginTop: '2px' }}
                          />
                          <span 
                            className="font-medium"
                            style={{ 
                              lineHeight: '1.6',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
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
