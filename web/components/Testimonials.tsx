"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Testimonials() {
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

  const testimonials = [
    {
      name: "John M.",
      meta: "32, Product Manager",
      text: "Before Hangover Shield, a Sunday hangover wiped out my entire day. Following a time-blocked plan actually worked. By 11 AM my anxiety was gone and I could function again.",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Lisa R.",
      meta: "28, Nurse",
      text: "I work 12-hour shifts. I can't afford to lose a day. The plan stabilized my stomach, lowered my heart racing, and I made it to my shift without feeling destroyed.",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Kevin T.",
      meta: "25, Designer",
      text: "The best part is not having to think. When I'm foggy, opening the app and seeing exactly what to do removes so much stress.",
      photo: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      name: "Mark D.",
      meta: "41, Father of two",
      text: "My kids feel it when I'm out of it. Hangover Shield literally gave me my Sunday back. I took them to the park without feeling like my body was fighting me.",
      photo: "https://randomuser.me/api/portraits/men/55.jpg",
    },
    {
      name: "Sarah J.",
      meta: "30, Tech Lead",
      text: "The anxiety part… wow. No app had ever treated it as part of the recovery. The breathing exercises and reminders helped me calm down so much.",
      photo: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      name: "Daniel P.",
      meta: "34, Chef",
      text: "My job is physical and starts early. The plan helped me hydrate properly and avoid that noon headache that always hits.",
      photo: "https://randomuser.me/api/portraits/men/73.jpg",
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
              What Real People Are Saying.
            </motion.h2>

            {/* Subtitle - reduced gap */}
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
              Real stories from real users who got their day back.
            </motion.p>

            {/* Testimonials grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full"
              style={{ marginTop: '4rem' }}
            >
              {testimonials.map((testimonial, idx) => {
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
                      className="rounded-3xl border border-white/40 bg-white/45 backdrop-blur-2xl transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] w-full h-full"
                      style={{
                        padding: '2rem',
                        boxShadow: '0 1px 24px rgba(0, 0, 0, 0.03)',
                        WebkitBackdropFilter: 'blur(24px)'
                      }}
                    >
                      {/* User header */}
                      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
                        {/* Avatar - larger with border and shadow */}
                        <div 
                          className="relative rounded-full overflow-hidden flex-shrink-0"
                          style={{
                            width: '56px',
                            height: '56px',
                            border: '2px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Image
                            src={testimonial.photo}
                            alt={testimonial.name}
                            width={72}
                            height={72}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        
                        {/* Name and meta */}
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <h3 
                            className="text-base font-bold text-text-dark font-display leading-tight"
                            style={{ 
                              letterSpacing: '-0.01em',
                              lineHeight: '1.3',
                              marginBottom: '0.125rem'
                            }}
                          >
                            {testimonial.name}
                          </h3>
                          <p 
                            className="text-sm text-text-body"
                            style={{ 
                              letterSpacing: '-0.01em',
                              fontWeight: '400',
                              color: 'rgb(106 106 109)',
                              lineHeight: '1.4'
                            }}
                          >
                            {testimonial.meta}
                          </p>
                        </div>
                      </div>

                      {/* Testimonial text with decorative quote */}
                      <div className="flex-1 flex flex-col">
                        <p 
                          className="text-base text-text-body leading-relaxed flex-1 relative"
                          style={{ 
                            lineHeight: '1.75',
                            letterSpacing: '-0.01em',
                            fontWeight: '400',
                            color: 'rgb(106 106 109)',
                            paddingLeft: '1.5rem'
                          }}
                        >
                          {/* Decorative opening quote */}
                          <span 
                            className="absolute left-0 top-0 text-3xl font-serif leading-none"
                            style={{
                              color: 'rgba(15, 63, 70, 0.15)',
                              fontFamily: 'Georgia, serif',
                              lineHeight: '1'
                            }}
                          >
                            "
                          </span>
                          {testimonial.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Legal micro-copy */}
            <motion.p
              variants={itemVariants}
              className="text-xs text-center mx-auto mt-8"
              style={{
                color: 'rgb(106 106 109)',
                letterSpacing: '-0.01em',
                fontWeight: '400',
                maxWidth: '640px',
                width: '100%',
                lineHeight: '1.6'
              }}
            >
              Testimonials are illustrative of real use. Individual results may vary.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
