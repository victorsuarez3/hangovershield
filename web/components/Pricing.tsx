"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, Check } from "lucide-react";

export default function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const plans = [
    {
      period: "Monthly",
      price: "$0.99",
      frequency: "per month",
      features: ["Support the app", "Unlock Smart Plan", "Cancel anytime"],
      cta: "Choose Monthly",
      highlight: false,
      Icon: Heart,
    },
    {
      period: "Yearly",
      price: "$11.99",
      frequency: "per year",
      features: [
        "Save money",
        "Auto-renews once yearly",
        "Full Smart Plan access",
      ],
      cta: "Choose Yearly",
      highlight: true,
      Icon: Sparkles,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-lime-mist opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-dark text-center mb-6 font-display"
          >
            Less than a bottled water.
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-text-body text-center max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            Support our independent app and unlock the full intelligent
            protocol.
          </motion.p>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            {plans.map((plan, idx) => {
              const Icon = plan.Icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: plan.highlight ? 1.02 : 1 }}
                  className={`rounded-3xl p-8 md:p-10 shadow-glass transition-all duration-300 border ${
                    plan.highlight
                      ? "glass border-2 border-deep-teal shadow-glass-lg"
                      : "glass border-white/40"
                  }`}
                >
                  {plan.highlight && (
                    <div className="flex items-center gap-2 mb-5">
                      <div className="px-4 py-1.5 rounded-full bg-deep-teal text-white-pure text-xs font-bold shadow-lg">
                        <span className="font-display">Best Value</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      plan.highlight
                        ? "bg-gradient-to-br from-deep-teal to-deep-teal/80"
                        : "bg-serenity-mint/50"
                    }`}>
                      <Icon size={24} className={plan.highlight ? "text-white-pure" : "text-deep-teal"} strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-text-dark font-display">
                      {plan.period}
                    </h3>
                  </div>

                  <div className="mb-8">
                    <p className="text-5xl md:text-6xl font-bold text-deep-teal font-display">
                      {plan.price}
                    </p>
                    <p className="text-sm text-text-body mt-2 font-medium">
                      {plan.frequency}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-3 text-text-body items-center text-[15px]">
                        <Check size={20} className="text-deep-teal flex-shrink-0" strokeWidth={2.5} />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full btn ${
                      plan.highlight ? "btn-primary shadow-glass-lg" : "btn-secondary"
                    } text-base`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            variants={itemVariants}
            className="text-center text-text-body max-w-2xl mx-auto leading-relaxed text-[15px] md:text-base"
          >
            Hangover Shield is an independent app. Your support lets us keep
            improving it for you and millions of people who want to enjoy their
            nights without losing their next day.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
