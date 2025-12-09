"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SEOContent() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What helps a hangover instantly?",
      answer:
        "Hydration is key. Start with water and electrolytes immediately. Hangover Shield creates a personalized recovery plan that includes hydration, light nutrition, and gentle movement based on your specific symptoms and schedule. The app helps you cure hangover fast by addressing dehydration, which is one of the main causes of hangover symptoms.",
    },
    {
      question: "Does anxiety get worse during a hangover?",
      answer:
        "Yes, hangover anxiety (hangxiety) is common. Alcohol affects neurotransmitters like GABA and serotonin, leading to increased anxiety and feelings of unease. Hangover Shield addresses this with breathing exercises, grounding techniques, and personalized messages that normalize what you're feeling. Our hangover recovery plan specifically includes anxiety relief strategies.",
    },
    {
      question: "How does Hangover Shield personalize recovery?",
      answer:
        "Hangover Shield asks about your symptoms, sleep quality, anxiety levels, and daily schedule. Using this information, it generates a time-blocked recovery plan tailored to your specific needs. This personalized hangover cure ensures you can recover without disrupting your day, with hydration, stomach stability, and sleep recovery guidance timed perfectly for your schedule.",
    },
    {
      question: "How to stop hangover nausea?",
      answer:
        "Gentle hydration, light bland foods, and avoiding triggers help. Hangover Shield's personalized plan includes specific timing for meals and hydration to stabilize your stomach based on your symptoms. The app provides a morning-after recovery protocol that addresses nausea through proper hydration and nutrition timing.",
    },
    {
      question: "What causes a hangover?",
      answer:
        "Hangovers are caused by dehydration, inflammation, disrupted sleep, and alcohol's effect on neurotransmitters. When you drink, alcohol causes your body to produce more urine, leading to dehydration. It also triggers inflammation and disrupts sleep quality. Hangover Shield addresses all these factors with a science-based recovery protocol that includes hydration, sleep recovery, and anxiety relief.",
    },
    {
      question: "Is Hangover Shield free?",
      answer:
        "Yes, Hangover Shield is free to download. The app provides personalized recovery plans based on real recovery science, with no magic pills or gimmicks. Our hangover recovery app helps you wake up without a hangover by following evidence-based protocols for hydration, nutrition, and anxiety management.",
    },
  ];

  return (
    <section 
      id="seo-content"
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
      </div>

      <div className="container-max-lg relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* SEO-Rich Content */}
          <article className="mb-12">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-text-dark font-display mb-6"
              style={{ 
                letterSpacing: '-0.03em',
                fontWeight: '700'
              }}
            >
              Understanding Hangovers and Recovery
            </h2>
            
            <div className="space-y-6 text-text-body leading-relaxed" style={{ fontSize: '1rem', lineHeight: '1.75', color: 'rgb(106 106 109)' }}>
              <p>
                A hangover occurs when your body processes alcohol, leading to dehydration, inflammation, and disrupted sleep patterns. The most effective way to cure hangover fast is through a structured recovery plan that addresses hydration, nutrition, and rest. Hangover Shield's personalized approach creates a time-blocked recovery schedule that helps your body restore balance naturally.
              </p>
              
              <p>
                Why does Hangover Shield work? Our hangover recovery app is based on validated wellness principles, not magic pills. We focus on hydration, sleep recovery, and anxiety relief—the three pillars of effective hangover recovery. By personalizing your recovery plan based on your symptoms, sleep quality, and daily schedule, we ensure you can recover without losing your day. Whether you're dealing with hangover anxiety, nausea, or fatigue, our app provides a morning-after recovery protocol tailored to your needs.
              </p>
              
              <p>
                The science behind hangover recovery involves restoring fluid balance, stabilizing blood sugar, and managing the anxiety that often accompanies alcohol withdrawal. Hangover Shield's time-blocked recovery plan addresses each of these factors at the right time, helping you wake up without a hangover or recover faster if you're already experiencing symptoms. Our approach combines hydration strategies, stomach stability techniques, and anxiety relief methods into a personalized hangover cure that fits your life.
              </p>
            </div>
          </article>

          {/* FAQ Section */}
          <section>
            <h2 
              className="text-3xl sm:text-4xl font-bold text-text-dark font-display mb-8"
              style={{ 
                letterSpacing: '-0.03em',
                fontWeight: '700'
              }}
            >
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="glass rounded-2xl overflow-hidden border border-white/40"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                  }}
                  initial={false}
                  animate={{ height: "auto" }}
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left group"
                    aria-expanded={openFAQ === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <h3 
                      className="text-lg font-semibold text-text-dark font-display pr-4"
                      style={{ 
                        letterSpacing: '-0.01em',
                        fontWeight: '600'
                      }}
                    >
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp size={20} className="text-deep-teal flex-shrink-0" />
                    ) : (
                      <ChevronDown size={20} className="text-deep-teal flex-shrink-0 group-hover:text-deep-teal/80 transition-colors" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div 
                        className="px-6 pb-4 text-text-body"
                        style={{ 
                          fontSize: '0.9375rem',
                          lineHeight: '1.7',
                          color: 'rgb(106 106 109)'
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

