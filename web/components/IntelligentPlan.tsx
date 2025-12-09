"use client";

import { motion } from "framer-motion";
import { Check, Heart, Brain, Sparkles, ArrowRight } from "lucide-react";

export default function IntelligentPlan() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.9, 
        ease: [0.16, 1, 0.3, 1] // Apple-like easing
      },
    },
  };

  const floatingVariants: any = {
    initial: { y: 0 },
    animate: {
      y: [-6, 6, -6],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1],
      },
    },
  };

  const planItems = [
    { time: "8:00 AM", action: "Water + electrolytes, soft light, breathing", icon: Heart },
    { time: "9:00 AM", action: "Breakfast matched to your symptoms", icon: Heart },
    { time: "11:00 AM", action: "Light walk & emotional check-in", icon: Brain },
    { time: "2:00 PM", action: "Light meal + rest", icon: Heart },
    { time: "6:00 PM", action: "Day closure review", icon: Brain },
  ];

  return (
    <section 
      id="plan" 
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ 
        paddingTop: '6rem', 
        paddingBottom: '5rem' 
      }}
    >
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-serenity-mint opacity-15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-soft-sky-blue opacity-12 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-serenity-mint/10 to-soft-sky-blue/10 rounded-full blur-3xl" />
        {/* Spotlight effect behind phone mockup */}
        <div className="absolute top-1/2 right-20 w-[400px] h-[500px] bg-white opacity-8 rounded-full blur-3xl hidden lg:block" style={{ transform: 'translateY(-50%)' }} />
      </div>

      <div className="container-max-lg relative z-10 w-full">
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{ gap: '6rem' }}
        >
          {/* Left content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-2xl lg:pr-12"
          >
            {/* Label pill */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 mb-4"
              style={{
                fontSize: '0.625rem',
                letterSpacing: '0.08em',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'rgb(106 106 109)'
              }}
            >
              <span>SMART PLAN</span>
              <span>•</span>
              <span>PERSONALIZED RECOVERY</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-text-dark leading-[1.08]"
              style={{ 
                marginBottom: '2rem',
                letterSpacing: '-0.03em',
                fontWeight: '700'
              }}
            >
              Your Day,{" "}
              <span className="text-gradient" style={{ letterSpacing: '-0.03em' }}>Rebuilt Intelligently.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-text-body leading-relaxed max-w-xl"
              style={{ 
                marginBottom: '0',
                lineHeight: '1.75',
                letterSpacing: '-0.015em',
                fontWeight: '400'
              }}
            >
              Hangover Shield analyzes your symptoms, sleep, anxiety level, and what you have to do today—then gives you a personalized, time-blocked protocol to get you back to your best.
            </motion.p>
          </motion.div>

          {/* Right side - iPhone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col items-center justify-start"
            style={{ paddingLeft: '3rem', paddingTop: '2rem' }}
          >
            {/* Wrapper with unified glow */}
            <div 
              className="relative flex flex-col items-center justify-center"
              style={{ 
                gap: '1rem',
                filter: 'drop-shadow(0 40px 120px rgba(15, 23, 42, 0.25))'
              }}
            >
              {/* iPhone frame mockup */}
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                className="relative"
                style={{ width: '16rem', transform: 'rotate(2deg)' }}
              >
                <div className="relative bg-white-pure rounded-[2.5rem] shadow-glass-lg overflow-hidden border-[10px] border-text-dark">
                  {/* Phone screen with Today's Recovery Plan UI */}
                  <div className="w-full aspect-[9/19] bg-gradient-to-b from-soft-sky-blue/25 to-serenity-mint/25 p-4 relative overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-8">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    
                    {/* Today's Recovery Plan Content */}
                    <div className="relative z-10 h-full flex flex-col" style={{ paddingTop: '1.25rem', paddingBottom: '1rem' }}>
                      {/* Header */}
                      <div style={{ marginBottom: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(15, 63, 70, 0.1)' }}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-deep-teal/25 to-deep-teal/15 flex items-center justify-center shadow-sm">
                            <Sparkles size={14} className="text-deep-teal" strokeWidth={2.5} />
                          </div>
                          <span 
                            className="text-deep-teal font-bold font-display"
                            style={{ fontSize: '0.625rem', letterSpacing: '0.08em' }}
                          >
                            SMART PLAN
                          </span>
                        </div>
                        <h3 
                          className="text-text-dark font-bold font-display leading-tight"
                          style={{ fontSize: '0.9375rem', letterSpacing: '-0.01em', lineHeight: '1.2' }}
                        >
                          Today's Recovery Plan
                        </h3>
                      </div>

                      {/* Plan Items - First 4 items with tighter spacing */}
                      <div style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {planItems.slice(0, 4).map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={idx}
                              className="glass-sm rounded-lg border border-white/40 flex items-center gap-2 relative overflow-hidden"
                              style={{ 
                                padding: '0.625rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(10px)'
                              }}
                            >
                              {/* Icon */}
                              <div className="w-7 h-7 rounded-lg bg-deep-teal/15 flex items-center justify-center flex-shrink-0">
                                <Icon size={14} className="text-deep-teal" strokeWidth={2.5} />
                              </div>
                              
                              {/* Time and Action */}
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-deep-teal font-bold font-mono"
                                  style={{ fontSize: '0.625rem', letterSpacing: '0.05em', lineHeight: '1.2', marginBottom: '0.125rem' }}
                                >
                                  {item.time}
                                </p>
                                <p 
                                  className="text-text-dark font-semibold"
                                  style={{ fontSize: '0.6875rem', lineHeight: '1.3', letterSpacing: '-0.01em' }}
                                >
                                  {item.action}
                                </p>
                              </div>
                              
                              {/* Check */}
                              <div className="w-5 h-5 rounded-full bg-lime-mist/50 flex items-center justify-center flex-shrink-0">
                                <Check size={12} className="text-deep-teal" strokeWidth={3} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* See full plan CTA - closer to mockup */}
              <motion.a
                href="#plan"
                className="inline-flex items-center gap-2 text-deep-teal font-medium text-sm hover:gap-3 transition-all duration-300 mt-1"
                style={{ 
                  letterSpacing: '-0.01em'
                }}
                whileHover={{ x: 4 }}
              >
                <span>See full plan</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </motion.a>
            </div>
          </motion.div>

          {/* Mobile version - Stacked */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex lg:hidden flex-col items-center justify-center gap-4 mt-8"
          >
            {/* Label pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="inline-flex items-center gap-2 mb-2"
              style={{
                fontSize: '0.625rem',
                letterSpacing: '0.08em',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'rgb(106 106 109)'
              }}
            >
              <span>SMART PLAN</span>
              <span>•</span>
              <span>PERSONALIZED RECOVERY</span>
            </motion.div>

            {/* iPhone frame mockup */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              className="relative"
              style={{ width: '14rem' }}
            >
              <div className="relative bg-white-pure rounded-[2.5rem] shadow-glass-lg overflow-hidden border-[10px] border-text-dark">
                {/* Phone screen with Today's Recovery Plan UI */}
                <div className="w-full aspect-[9/19] bg-gradient-to-b from-soft-sky-blue/25 to-serenity-mint/25 p-4 relative overflow-hidden">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-8">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  
                  {/* Today's Recovery Plan Content */}
                  <div className="relative z-10 h-full flex flex-col" style={{ paddingTop: '1.25rem', paddingBottom: '1rem' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(15, 63, 70, 0.1)' }}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-deep-teal/25 to-deep-teal/15 flex items-center justify-center shadow-sm">
                          <Sparkles size={14} className="text-deep-teal" strokeWidth={2.5} />
                        </div>
                        <span 
                          className="text-deep-teal font-bold font-display"
                          style={{ fontSize: '0.625rem', letterSpacing: '0.08em' }}
                        >
                          SMART PLAN
                        </span>
                      </div>
                      <h3 
                        className="text-text-dark font-bold font-display leading-tight"
                        style={{ fontSize: '0.9375rem', letterSpacing: '-0.01em', lineHeight: '1.2' }}
                      >
                        Today's Recovery Plan
                      </h3>
                    </div>

                    {/* Plan Items - First 4 items with tighter spacing */}
                    <div style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {planItems.slice(0, 4).map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={idx}
                            className="glass-sm rounded-lg border border-white/40 flex items-center gap-2 relative overflow-hidden"
                            style={{ 
                              padding: '0.625rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.5)',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            {/* Icon */}
                            <div className="w-7 h-7 rounded-lg bg-deep-teal/15 flex items-center justify-center flex-shrink-0">
                              <Icon size={14} className="text-deep-teal" strokeWidth={2.5} />
                            </div>
                            
                            {/* Time and Action */}
                            <div className="flex-1 min-w-0">
                              <p 
                                className="text-deep-teal font-bold font-mono"
                                style={{ fontSize: '0.625rem', letterSpacing: '0.05em', lineHeight: '1.2', marginBottom: '0.125rem' }}
                              >
                                {item.time}
                              </p>
                              <p 
                                className="text-text-dark font-semibold"
                                style={{ fontSize: '0.6875rem', lineHeight: '1.3', letterSpacing: '-0.01em' }}
                              >
                                {item.action}
                              </p>
                            </div>
                            
                            {/* Check */}
                            <div className="w-5 h-5 rounded-full bg-lime-mist/50 flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-deep-teal" strokeWidth={3} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* See full plan CTA - closer to mockup */}
            <motion.a
              href="#plan"
              className="inline-flex items-center gap-2 text-deep-teal font-medium text-sm hover:gap-3 transition-all duration-300 mt-1"
              style={{ 
                letterSpacing: '-0.01em'
              }}
              whileHover={{ x: 4 }}
            >
              <span>See full plan</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
