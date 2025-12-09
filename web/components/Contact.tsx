"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactInfo = [
  {
    Icon: Mail,
    title: "Email",
    value: "support@hangovershield.co",
    href: "mailto:support@hangovershield.co",
  },
  {
    Icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    Icon: MapPin,
    title: "Location",
    value: "San Francisco, CA",
    href: "#",
  },
  {
    Icon: Clock,
    title: "Hours",
    value: "Mon - Fri, 9AM - 6PM PT",
    href: "#",
  },
];

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
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulamos envío (en producción, integrar con Firebase/API)
    console.log("Contact form submission:", formData);

    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Resetear el mensaje después de 5 segundos
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden"
      style={{ 
        paddingTop: '8rem', 
        paddingBottom: '7rem' 
      }}
    >
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-soft-sky-blue opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-serenity-mint opacity-5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-deep-teal opacity-3 rounded-full blur-3xl" />
      </div>

      <div className="container-max-lg relative z-10">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          style={{ marginBottom: '5rem' }}
        >
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-6xl font-bold text-text-dark font-display leading-[1.1] tracking-tight"
            style={{ 
              marginBottom: '1.75rem',
              letterSpacing: '-0.02em',
              width: '100%'
            }}
          >
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <p 
            className="text-lg sm:text-xl lg:text-xl text-text-body max-w-2xl leading-relaxed"
            style={{ 
              lineHeight: '1.75',
              letterSpacing: '-0.01em',
              width: '100%'
            }}
          >
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ marginBottom: '5rem' }}>
          {/* Contact Info Cards */}
          <motion.div
            className="lg:col-span-1"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div style={{ gap: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              {contactInfo.map((info, index) => {
                const Icon = info.Icon;
                return (
                  <motion.a
                    key={index}
                    href={info.href}
                    className="glass rounded-2xl hover:shadow-glass-lg transition-all duration-300 block group border border-white/40"
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ padding: '1.75rem' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-teal/15 to-deep-teal/10 flex items-center justify-center mb-4 group-hover:from-deep-teal/20 group-hover:to-deep-teal/15 transition-all duration-300">
                      <Icon size={22} className="text-deep-teal" strokeWidth={2.5} />
                    </div>
                    <h3 
                      className="font-semibold text-text-dark mb-2 font-display"
                      style={{ 
                        fontSize: '0.9375rem',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {info.title}
                    </h3>
                    <p 
                      className="text-text-body text-sm"
                      style={{ 
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {info.value}
                    </p>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleSubmit}
              className="glass rounded-3xl border border-white/40 relative overflow-hidden"
              style={{ padding: '2.5rem' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-deep-teal/5 pointer-events-none" />
              
              <div className="relative z-10" style={{ gap: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-text-dark mb-2 font-display"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full rounded-xl bg-white/70 border border-white/60 text-text-dark placeholder-text-body/50 focus:outline-none focus:border-deep-teal/50 focus:ring-2 focus:ring-deep-teal/20 transition-all duration-300 font-medium"
                      style={{ 
                        fontSize: '0.9375rem',
                        paddingTop: '1rem',
                        paddingBottom: '1rem',
                        paddingLeft: '1.25rem',
                        paddingRight: '1.25rem'
                      }}
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-text-dark mb-2 font-display"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full rounded-xl bg-white/70 border border-white/60 text-text-dark placeholder-text-body/50 focus:outline-none focus:border-deep-teal/50 focus:ring-2 focus:ring-deep-teal/20 transition-all duration-300 font-medium"
                      style={{ 
                        fontSize: '0.9375rem',
                        paddingTop: '1rem',
                        paddingBottom: '1rem',
                        paddingLeft: '1.25rem',
                        paddingRight: '1.25rem'
                      }}
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-text-dark mb-2 font-display"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this about?"
                    className="w-full rounded-xl bg-white/70 border border-white/60 text-text-dark placeholder-text-body/50 focus:outline-none focus:border-deep-teal/50 focus:ring-2 focus:ring-deep-teal/20 transition-all duration-300 font-medium"
                    style={{ 
                      fontSize: '0.9375rem',
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      paddingLeft: '1.25rem',
                      paddingRight: '1.25rem'
                    }}
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-text-dark mb-2 font-display"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="w-full rounded-xl bg-white/70 border border-white/60 text-text-dark placeholder-text-body/50 focus:outline-none focus:border-deep-teal/50 focus:ring-2 focus:ring-deep-teal/20 transition-all duration-300 resize-none font-medium"
                    style={{ 
                      fontSize: '0.9375rem', 
                      lineHeight: '1.6',
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      paddingLeft: '1.25rem',
                      paddingRight: '1.25rem'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || submitted}
                  whileHover={!isLoading && !submitted ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isLoading && !submitted ? { scale: 0.98 } : {}}
                  className="btn btn-primary w-full font-semibold disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  style={{
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin">⏳</span>
                      Sending...
                    </span>
                  ) : submitted ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>✓</span>
                      Message Sent!
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </motion.button>

                {/* Success Message */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-lime-mist/40 border border-lime-mist text-text-dark text-sm font-medium"
                    style={{ fontSize: '0.875rem' }}
                  >
                    ✅ Thanks for reaching out! We'll get back to you soon.
                  </motion.div>
                )}
              </div>
            </form>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 
            className="text-3xl sm:text-4xl font-bold text-text-dark text-center mb-12 font-display"
            style={{ 
              letterSpacing: '-0.02em',
              marginBottom: '3rem'
            }}
          >
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
            {[
              {
                q: "What is Hangover Shield?",
                a: "Hangover Shield is a smart app that helps prevent and reduce hangover symptoms through intelligent pre-drinking and post-drinking protocols.",
              },
              {
                q: "Is it available on iOS and Android?",
                a: "Yes! Hangover Shield is available on both the Apple App Store and Google Play Store.",
              },
              {
                q: "How long does it take to work?",
                a: "You'll notice improvements within the first 2-3 uses. Best results come when you follow the plan consistently.",
              },
              {
                q: "Can I use it for free?",
                a: "Yes! Basic features are free. Unlock the full Smart Plan for personalized recovery protocols.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="glass rounded-2xl border border-white/40 group cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                style={{ padding: '1.75rem' }}
              >
                <h4 
                  className="font-semibold text-text-dark mb-3 flex items-start gap-3 font-display"
                  style={{ 
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.5'
                  }}
                >
                  <span className="text-deep-teal text-lg flex-shrink-0">Q:</span>
                  {faq.q}
                </h4>
                <p 
                  className="text-text-body text-sm"
                  style={{ 
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    letterSpacing: '-0.01em',
                    marginLeft: '1.75rem'
                  }}
                >
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
