"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#plan", label: "Smart Plan" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <motion.nav
      role="navigation"
      aria-label="Main navigation"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass shadow-glass backdrop-blur-xl border-b border-white/20"
          : "bg-transparent"
      }`}
    >
      <div className="container-max-lg" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="flex items-center justify-between h-18 md:h-20 py-4 md:py-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group transition-all duration-300"
            style={{ marginRight: '3rem' }}
            aria-label="Hangover Shield - Home"
          >
            <span className="text-xl font-bold text-deep-teal font-display tracking-tight group-hover:text-deep-teal/80 transition-colors duration-200 leading-tight">
              Hangover Shield
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div 
            className="hidden md:flex items-center flex-1 justify-center"
            style={{ gap: '2rem', marginLeft: '2rem', marginRight: '2rem' }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => setActiveLink(link.href)}
                onMouseLeave={() => setActiveLink("")}
                className="relative text-text-body hover:text-deep-teal transition-all duration-300 font-medium text-[15px] rounded-xl group focus:outline-none focus:ring-2 focus:ring-deep-teal focus:ring-offset-2"
                style={{ 
                  paddingLeft: '1.5rem', 
                  paddingRight: '1.5rem', 
                  paddingTop: '0.875rem', 
                  paddingBottom: '0.875rem' 
                }}
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
                {activeLink === link.href && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute bg-white/40 backdrop-blur-sm rounded-lg -z-10 shadow-sm"
                    style={{
                      top: '4px',
                      left: '4px',
                      right: '4px',
                      bottom: '4px'
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="#download"
            className="btn btn-primary text-sm md:text-[15px] group shadow-glass-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-deep-teal focus:ring-offset-2"
            style={{ marginLeft: '2rem' }}
            aria-label="Download Hangover Shield app"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform duration-300" aria-hidden="true" />
            <span className="hidden sm:inline font-semibold">Download App</span>
            <span className="sm:hidden font-semibold">Download</span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
