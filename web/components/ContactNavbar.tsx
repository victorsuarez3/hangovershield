"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactNavbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 glass shadow-glass backdrop-blur-xl border-b border-white/20`}
    >
      <div className="container-max-lg" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="flex items-center justify-between h-18 md:h-20 py-4 md:py-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group transition-all duration-300"
          >
            <span className="text-xl font-bold text-deep-teal font-display tracking-tight group-hover:text-deep-teal/80 transition-colors duration-200 leading-tight">
              Hangover Shield
            </span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

