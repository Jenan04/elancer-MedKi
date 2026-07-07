"use client";

import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#F5F2ED]/80 backdrop-blur-md border-b border-[#A89F91]/25 py-3 shadow-xs"
          : "bg-[#F5F2ED] py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-[#1A1A1A] text-[#F5F2ED] transition-transform duration-300 group-hover:scale-105">
            {/* Minimalist Surgical Cross Icon */}
            <svg
              className="w-4.5 h-4.5 text-[#D44D44] animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span className="font-caslon text-2xl font-bold tracking-tight text-[#1A1A1A]">
            med<span className="text-[#D44D44]">ki</span>
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {["Home", "Flashcards", "AI Converters", "Contact"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(" ", "-")}`}
              className="relative text-sm font-semibold text-[#1A1A1A]/80 transition-colors duration-200 hover:text-[#D44D44] font-grotesk group py-1"
            >
              {link}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D44D44] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <a
            href="#demo"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-[#1A1A1A]/20 hover:border-[#D44D44] rounded-md text-xs font-mono tracking-wider uppercase text-[#1A1A1A] hover:text-[#D44D44] transition-all duration-300 hover:bg-[#D44D44]/5"
          >
            Launch app
          </a>
          <a
            href="#convert"
            className="inline-flex items-center justify-center px-4.5 py-2.5 bg-[#D44D44] hover:bg-[#D44D44]/95 text-white font-grotesk text-sm font-semibold rounded-md shadow-sm transition-all duration-300 hover:shadow-md active:scale-98"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
