"use client";

import { motion } from "framer-motion";
import { Brain, Zap, MessageCircle } from "lucide-react";

export default function Problem() {
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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] // Apple-like easing
      },
    },
  };

  const cards = [
    { 
      Icon: Brain, 
      title: "Hangxiety on Wake",
      description: "Morning anxiety spike before you're even out of bed."
    },
    { 
      Icon: Zap, 
      title: "Energy on the Floor",
      description: "Slow start, zero momentum, nothing gets done."
    },
    { 
      Icon: MessageCircle, 
      title: "Guilt & Social Regret",
      description: "Replay of conversations and choices that weigh on you."
    },
  ];

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        paddingTop: '5.5rem', 
        paddingBottom: '5.5rem' 
      }}
    >
      {/* Subtle background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-serenity-mint opacity-8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-soft-sky-blue opacity-6 rounded-full blur-3xl" />
      </div>

      <div className="container-max-lg relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center w-full"
        >
          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-5xl font-bold text-text-dark text-center leading-[1.08] font-display"
            style={{ 
              marginBottom: '1.75rem',
              letterSpacing: '-0.03em',
              fontWeight: '700',
              maxWidth: '42rem',
              width: '100%'
            }}
          >
            It's not just a headache.{" "}
            <span className="text-gradient" style={{ letterSpacing: '-0.03em' }}>It's your whole day at risk.</span>
          </motion.h2>

          {/* First paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-lg text-text-body text-center leading-relaxed"
            style={{ 
              marginBottom: '0',
              lineHeight: '1.75',
              letterSpacing: '-0.015em',
              fontWeight: '400',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            Hangover is more than physical. It's brutal anxiety, guilt, zero
            energy to work or study, decisions postponed, time lost. All normal.
            But none of it should be inevitable.
          </motion.p>

          {/* Second paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-lg text-text-body text-center leading-relaxed"
            style={{ 
              marginTop: '1.5rem',
              marginBottom: '3rem',
              lineHeight: '1.75',
              letterSpacing: '-0.015em',
              fontWeight: '400',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            That perfect night becomes a whole day in the fog. Productivity
            crashes. Mood tanks. Relationships strain. What if you could avoid
            all that?
          </motion.p>

          {/* Premium cards grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full"
            style={{ maxWidth: '54rem' }}
          >
            {cards.map((card, idx) => {
              const Icon = card.Icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="glass-sm rounded-2xl border border-white/40 shadow-glass hover:shadow-glass-lg transition-all duration-300 flex flex-col group cursor-pointer"
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-deep-teal/15 to-deep-teal/10 flex items-center justify-center flex-shrink-0 mb-2.5 group-hover:from-deep-teal/20 group-hover:to-deep-teal/15 transition-all duration-300">
                    <Icon size={20} className="text-deep-teal" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="text-text-dark font-bold font-display"
                    style={{ 
                      fontSize: '0.9375rem',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.3',
                      marginBottom: '0.375rem'
                    }}
                  >
                    {card.title}
                  </h3>
                  
                  {/* Description */}
                  <p 
                    className="text-text-body"
                    style={{ 
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      letterSpacing: '-0.01em',
                      fontWeight: '400'
                    }}
                  >
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
