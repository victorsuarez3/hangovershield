"use client";

import { motion } from "framer-motion";
import { Heart, Brain, HandHeart, Globe } from "lucide-react";

export default function WhyItWorks() {
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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const reasons = [
    {
      title: "Designed for the Real Body",
      description:
        "Based on hydration, sleep, and validated wellness principles. No magic pills.",
      Icon: Heart,
    },
    {
      title: "Anti-Hangxiety by Design",
      description:
        "Breathing exercises, grounding techniques, and messages that normalize what you feel.",
      Icon: Brain,
    },
    {
      title: "No Judgment. No Lectures.",
      description:
        "We don't tell you to stop drinking. We help you take care of yourself better.",
      Icon: HandHeart,
    },
    {
      title: "Made for Real Adults",
      description:
        "Work, studies, travel, social life—all together. We get it.",
      Icon: Globe,
    },
  ];

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        paddingTop: '5rem', 
        paddingBottom: '5rem' 
      }}
    >
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-serenity-mint opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-soft-sky-blue opacity-5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lime-mist opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="container-max-lg relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl font-bold text-text-dark text-center font-display leading-[1.1] tracking-tight max-w-5xl"
            style={{ 
              marginBottom: '3rem',
              letterSpacing: '-0.02em',
              width: '100%'
            }}
          >
            Why it works.
          </motion.h2>

          <div 
            className="grid grid-cols-1 md:grid-cols-2 w-full"
            style={{ gap: '1.5rem', maxWidth: '70rem' }}
          >
            {reasons.map((reason, idx) => {
              const Icon = reason.Icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass rounded-3xl shadow-glass hover:shadow-glass-lg transition-all duration-300 border border-white/40 group cursor-pointer h-full flex flex-col relative overflow-hidden"
                  style={{ padding: '2rem' }}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-deep-teal/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 w-18 h-18 bg-gradient-to-br from-deep-teal to-deep-teal/85 flex items-center justify-center transition-all duration-300 mb-5 group-hover:scale-105" style={{ width: '4rem', height: '4rem' }}>
                    <Icon size={24} className="text-white-pure" strokeWidth={2.5} />
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-text-dark font-display leading-tight relative z-10"
                    style={{ 
                      marginBottom: '1rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {reason.title}
                  </h3>
                  
                  <p 
                    className="text-text-body leading-relaxed font-medium relative z-10 flex-1"
                    style={{ 
                      fontSize: '0.875rem',
                      lineHeight: '1.65',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {reason.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
