"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, FileText, HelpCircle } from "lucide-react";
import Modal from "./Modal";
import { PrivacyPolicyContent, TermsConditionsContent, SupportContent } from "./ModalContents";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <>
      <footer 
        className="border-t border-white-pure border-opacity-20 relative overflow-hidden"
        style={{ marginTop: '7rem' }}
      >
        {/* Background accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-serenity-mint opacity-3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-soft-sky-blue opacity-3 rounded-full blur-3xl" />
        </div>

        <div className="container-max-lg relative z-10">
          {/* Main footer content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ paddingTop: '3rem', paddingBottom: '2rem' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16">
              {/* Brand */}
              <motion.div variants={itemVariants}>
                <Link href="/" className="flex items-center mb-3 group">
                  <span className="font-bold text-deep-teal text-lg font-display" style={{ letterSpacing: '-0.01em' }}>
                    Hangover Shield
                  </span>
                </Link>
                <p 
                  className="text-text-body leading-relaxed"
                  style={{ 
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    letterSpacing: '-0.01em',
                    color: 'rgb(106 106 109)',
                    fontWeight: '400'
                  }}
                >
                  Feel like yourself again—calmer, faster.
                </p>
              </motion.div>

              {/* Product Links */}
              <motion.div variants={itemVariants}>
                <h4 
                  className="font-semibold text-text-dark mb-4 text-xs font-display uppercase tracking-wide"
                  style={{ 
                    letterSpacing: '0.12em',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  Product
                </h4>
                <ul style={{ gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                  <li>
                    <a
                      href="#how-it-works"
                      className="text-text-body transition-all duration-200 inline-flex items-center group"
                      style={{ 
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        color: 'rgb(106 106 109)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(15, 63, 70)';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.textDecorationThickness = '1px';
                        e.currentTarget.style.textUnderlineOffset = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(106 106 109)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#plan"
                      className="text-text-body transition-all duration-200 inline-flex items-center group"
                      style={{ 
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        color: 'rgb(106 106 109)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(15, 63, 70)';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.textDecorationThickness = '1px';
                        e.currentTarget.style.textUnderlineOffset = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(106 106 109)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      Smart Plan
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-text-body transition-all duration-200 inline-flex items-center group"
                      style={{ 
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        color: 'rgb(106 106 109)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(15, 63, 70)';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.textDecorationThickness = '1px';
                        e.currentTarget.style.textUnderlineOffset = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(106 106 109)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* Legal Links */}
              <motion.div variants={itemVariants}>
                <h4 
                  className="font-semibold text-text-dark mb-4 text-xs font-display uppercase tracking-wide"
                  style={{ 
                    letterSpacing: '0.12em',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  Legal
                </h4>
                <ul style={{ gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                  <li>
                    <button
                      onClick={() => setActiveModal("privacy")}
                      className="text-text-body transition-all duration-200 inline-flex items-center group text-left w-full"
                      style={{ 
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        color: 'rgb(106 106 109)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(15, 63, 70)';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.textDecorationThickness = '1px';
                        e.currentTarget.style.textUnderlineOffset = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(106 106 109)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      <Shield size={14} className="mr-2 opacity-60 group-hover:opacity-80 transition-opacity duration-200" strokeWidth={2} />
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal("terms")}
                      className="text-text-body transition-all duration-200 inline-flex items-center group text-left w-full"
                      style={{ 
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        color: 'rgb(106 106 109)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(15, 63, 70)';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.textDecorationThickness = '1px';
                        e.currentTarget.style.textUnderlineOffset = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(106 106 109)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      <FileText size={14} className="mr-2 opacity-60 group-hover:opacity-80 transition-opacity duration-200" strokeWidth={2} />
                      Terms & Conditions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal("support")}
                      className="text-text-body transition-all duration-200 inline-flex items-center group text-left w-full"
                      style={{ 
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        color: 'rgb(106 106 109)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(15, 63, 70)';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.textDecorationThickness = '1px';
                        e.currentTarget.style.textUnderlineOffset = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(106 106 109)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      <HelpCircle size={14} className="mr-2 opacity-60 group-hover:opacity-80 transition-opacity duration-200" strokeWidth={2} />
                      Support
                    </button>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-white-pure bg-opacity-20" />

          {/* Copyright - Separated section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
            style={{ paddingTop: '1.75rem', paddingBottom: '2rem' }}
          >
            <p
              className="text-sm text-text-body"
              style={{ 
                fontSize: '0.8125rem',
                lineHeight: '1.6',
                letterSpacing: '-0.01em',
                fontWeight: '400',
                color: 'rgb(140 140 143)'
              }}
            >
              © {currentYear} Hangover Shield. Designed with care for adults who
              want to take care of themselves better.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Modals */}
      <Modal
        isOpen={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </Modal>

      <Modal
        isOpen={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
        title="Terms & Conditions"
      >
        <TermsConditionsContent />
      </Modal>

      <Modal
        isOpen={activeModal === "support"}
        onClose={() => setActiveModal(null)}
        title="Support"
      >
        <SupportContent />
      </Modal>
    </>
  );
}
