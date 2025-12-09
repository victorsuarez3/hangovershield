"use client";

import { motion } from "framer-motion";
import { Download, Sparkles, Heart, Brain, Check, Clock, Coffee, Activity } from "lucide-react";
import Image from "next/image";

export default function Hero() {
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
        ease: [0.4, 0, 0.6, 1], // More subtle easing
      },
    },
  };

  const planItems = [
    { time: "7:00 AM", action: "Soft light & breathing", icon: Heart },
    { time: "8:00 AM", action: "Water + electrolytes", icon: Heart },
    { time: "9:00 AM", action: "Light breakfast", icon: Coffee },
    { time: "11:00 AM", action: "Light walk & check-in", icon: Brain },
    { time: "2:00 PM", action: "Light meal + rest", icon: Clock },
    { time: "6:00 PM", action: "Day closure review", icon: Activity },
  ];

  return (
    <section 
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ 
        paddingTop: '7rem', 
        paddingBottom: '5rem' 
      }}
    >
      {/* Enhanced background decorative elements - more subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-serenity-mint opacity-15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-soft-sky-blue opacity-12 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-serenity-mint/8 to-soft-sky-blue/8 rounded-full blur-3xl" />
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
            animate="visible"
            className="max-w-2xl lg:pr-12"
          >
            {/* Eyebrow chip */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 sm:gap-2 glass-sm rounded-full py-1.5 mb-4 border border-white/30"
              style={{ 
                paddingLeft: '1rem',
                paddingRight: '1rem',
                fontSize: '0.625rem',
                letterSpacing: '0.05em',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'rgb(15, 63, 70)',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span className="text-deep-teal">Smart Recovery</span>
              <span className="text-text-body/60">·</span>
              <span className="text-text-body">Before</span>
              <span className="text-text-body/60">·</span>
              <span className="text-text-body">During</span>
              <span className="text-text-body/60">·</span>
              <span className="text-text-body">After</span>
            </motion.div>

            <h1>
              <motion.span
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-text-dark leading-[1.08] block"
                style={{ 
                  marginBottom: '2rem',
                  letterSpacing: '-0.03em',
                  fontWeight: '700'
                }}
              >
                Cure Hangover Fast:{" "}
                <span className="text-gradient" style={{ letterSpacing: '-0.03em' }}>Recovery App That Works</span>
              </motion.span>
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-text-body leading-relaxed max-w-xl"
              style={{ 
                marginBottom: '3rem',
                lineHeight: '1.75',
                letterSpacing: '-0.015em',
                fontWeight: '400'
              }}
            >
              Hangover Shield is your intelligent protocol to prevent hangover,
              calm hangxiety, and recover your day — before, during, and after
              drinking.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row"
              style={{ 
                gap: '1.5rem',
                marginBottom: '3rem'
              }}
            >
              <motion.a 
                href="#download" 
                className="btn btn-primary text-base group relative overflow-hidden w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-deep-teal focus:ring-offset-2"
                style={{ 
                  paddingTop: '1.125rem',
                  paddingBottom: '1.125rem',
                  paddingLeft: '2.25rem',
                  paddingRight: '2.25rem',
                  fontWeight: '600',
                  letterSpacing: '-0.01em'
                }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                aria-label="Download Hangover Shield app - cure hangover fast"
              >
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform duration-300 relative z-10" aria-hidden="true" />
                <span className="relative z-10">Download Hangover Shield</span>
              </motion.a>
              <motion.a 
                href="#how-it-works" 
                className="btn btn-secondary text-base group w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-deep-teal focus:ring-offset-2"
                style={{ 
                  paddingTop: '1.125rem',
                  paddingBottom: '1.125rem',
                  paddingLeft: '2.25rem',
                  paddingRight: '2.25rem',
                  fontWeight: '600',
                  letterSpacing: '-0.01em'
                }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                aria-label="Learn how Hangover Shield works"
              >
                See How It Works
              </motion.a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-start gap-3 text-sm text-text-body"
              style={{ 
                paddingTop: '1.5rem',
                marginTop: '0.5rem'
              }}
            >
              <Sparkles 
                size={17} 
                className="text-deep-teal flex-shrink-0" 
                style={{ marginTop: '3px' }} 
              />
              <p 
                className="italic leading-relaxed" 
                style={{ 
                  fontSize: '0.875rem',
                  lineHeight: '1.65',
                  color: 'rgb(106 106 109)',
                  letterSpacing: '-0.01em',
                  fontWeight: '400'
                }}
              >
                Designed for real adults who want to enjoy the night without
                losing the next day.
              </p>
            </motion.div>
          </motion.div>

          {/* Right side - Human photo + iPhone mockup side by side (Desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center"
            style={{ paddingLeft: '3rem' }}
          >
            {/* Wrapper with unified glow */}
            <div 
              className="relative flex items-center justify-center"
              style={{ 
                gap: '2.5rem',
                filter: 'drop-shadow(0 40px 120px rgba(15, 23, 42, 0.25))'
              }}
            >
              {/* Human photo card - left side */}
              <motion.div
                initial={{ opacity: 0, x: -30, rotate: -1.5 }}
                animate={{ opacity: 1, x: 0, rotate: -1.5 }}
                transition={{ duration: 1.3, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
                style={{ 
                  width: '21rem',
                  height: '28rem'
                }}
              >
                <div 
                  className="glass rounded-3xl shadow-glass-lg overflow-hidden border border-white/50 relative h-full"
                >
                  <Image
                    src="https://plus.unsplash.com/premium_photo-1676550906503-396d6c2ace5b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Happy person feeling refreshed after using Hangover Shield recovery app - morning recovery success"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 0vw, 336px"
                    priority
                    fetchPriority="high"
                  />
                  {/* More subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-deep-teal/8" />
                </div>
              </motion.div>

              {/* iPhone frame mockup - right side */}
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                className="relative"
                style={{ width: '18rem', transform: 'translateY(-1.5rem) rotate(1.5deg)' }}
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
                      <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(15, 63, 70, 0.1)' }}>
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

                      {/* Plan Items */}
                      <div style={{ gap: '0.625rem', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                        {planItems.map((item, idx) => {
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
            </div>
          </motion.div>

          {/* Mobile version - Stacked and centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex lg:hidden flex-col items-center justify-center gap-6 mt-8"
          >
            {/* Wrapper with unified glow */}
            <div 
              className="relative flex flex-col items-center justify-center"
              style={{ 
                gap: '1.5rem',
                filter: 'drop-shadow(0 40px 120px rgba(15, 23, 42, 0.25))'
              }}
            >
              {/* Human photo card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.3, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
                style={{ 
                  width: '16rem',
                  height: '20rem'
                }}
              >
                <div 
                  className="glass rounded-3xl shadow-glass-lg overflow-hidden border border-white/50 relative h-full"
                >
                  <Image
                    src="https://plus.unsplash.com/premium_photo-1676550906503-396d6c2ace5b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Happy person feeling refreshed after using Hangover Shield recovery app - morning recovery success"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 0vw"
                    priority
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-deep-teal/8" />
                </div>
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
                      <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(15, 63, 70, 0.1)' }}>
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

                      {/* Plan Items */}
                      <div style={{ gap: '0.625rem', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                        {planItems.map((item, idx) => {
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
              </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
