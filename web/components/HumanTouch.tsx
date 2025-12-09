"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Coffee, Users, Briefcase } from "lucide-react";

export default function HumanTouch() {
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

  const moments = [
    {
      image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
      alt: "Friends enjoying brunch and coffee together",
      caption: "Brunch with friends, fully present.",
      Icon: Coffee,
    },
    {
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
      alt: "People working together at a cafe",
      caption: "Monday work, without the fog.",
      Icon: Briefcase,
    },
    {
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
      alt: "Friends laughing and having fun together",
      caption: "Sundays you remember, not recover from.",
      Icon: Users,
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
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-lime-mist opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-glow-coral opacity-5 rounded-full blur-3xl" />
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
              Real moments, real recovery.
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-lg text-center mx-auto leading-relaxed"
              style={{ 
                marginTop: '1rem',
                marginBottom: '0',
                lineHeight: '1.75',
                letterSpacing: '-0.015em',
                fontWeight: '400',
                maxWidth: '640px',
                width: '100%',
                color: 'rgb(106 106 109)'
              }}
            >
              Don't lose your day. Hangover Shield helps you bounce back and stay
              present in the moments that matter.
            </motion.p>

            {/* Grid of cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full"
              style={{ marginTop: '3rem' }}
            >
              {moments.map((moment, idx) => {
                const Icon = moment.Icon;
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
                      className="rounded-[24px] border border-white/40 bg-white/45 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] p-6 sm:p-7 md:p-8 w-full h-full"
                      style={{
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                        WebkitBackdropFilter: 'blur(24px)'
                      }}
                    >
                      {/* Image */}
                      <div className="relative w-full h-[240px] rounded-[20px] overflow-hidden bg-white mb-6 flex-shrink-0">
                        <Image
                          src={moment.image}
                          alt={`${moment.alt} - Real moment of recovery with Hangover Shield app`}
                          fill
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </div>

                      {/* Icon + Caption */}
                      <div className="flex items-center justify-center gap-2.5 text-center flex-1" style={{ minHeight: '64px', alignItems: 'center' }}>
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <Icon size={18} className="text-deep-teal" strokeWidth={2.5} />
                        </div>
                        <p 
                          className="text-[15px] md:text-base font-medium text-gray-900 leading-relaxed"
                          style={{ 
                            lineHeight: '1.6',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {moment.caption}
                        </p>
                      </div>
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
