"use client";

import React from "react";
import Navbar from "@/components/shared/Navbar";
import ScrollVideoSection from "@/components/ScrollVideoSection";
import FeaturesSection from "@/components/FeaturesSection";
import InteractiveDemo from "@/components/InteractiveDemo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2ED] selection:bg-[#D44D44] selection:text-white">
      <Navbar />

      <main className="flex-1">
        <ScrollVideoSection />

        <FeaturesSection />

        <InteractiveDemo />

        <section id="contact" className="py-20 bg-[#1A1A1A] text-[#F5F2ED] relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-5 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 4v16m8-8H4" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="text-[10px] font-mono text-[#D44D44] tracking-widest uppercase font-bold">
                  Clinical Assistance
                </span>
                <h2 className="font-caslon text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                  Need custom pipelines for your med school?
                </h2>
                <p className="font-grotesk text-sm text-[#F5F2ED]/70 max-w-xl">
                  We partner directly with institutional study boards and educators to design automated spaced-repetition pipelines tailored for boards and clerkship guidelines.
                </p>
              </div>
              <div className="md:col-span-4 flex justify-start md:justify-end">
                <a
                  href="mailto:support@medki.app"
                  className="px-6 py-3 bg-[#D44D44] hover:bg-[#D44D44]/90 text-white font-grotesk font-semibold text-sm rounded-md transition-all duration-300 hover:shadow-md active:scale-98"
                >
                  Contact Dev Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1A1A1A] text-[#F5F2ED]/50 font-grotesk text-xs border-t border-[#F5F2ED]/10 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-[#F5F2ED]/10">
            
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-[#F5F2ED]/15 text-[#D44D44]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-caslon text-xl font-bold tracking-tight text-[#F5F2ED]">
                  med<span className="text-[#D44D44]">ki</span>
                </span>
              </div>
              <p className="text-[11px] text-[#F5F2ED]/60 max-w-sm leading-relaxed">
                The medical education engine. Translating complex lecture resources and anatomical diagrams into retention-optimized study workflows.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <h4 className="font-mono text-[9px] text-[#F5F2ED] tracking-widest uppercase font-bold">
                Platform Utilities
              </h4>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <a href="#home" className="hover:text-white transition-colors">
                    Scroll animation runway
                  </a>
                </li>
                <li>
                  <a href="#flashcards" className="hover:text-white transition-colors">
                    Active Recall Cards
                  </a>
                </li>
                <li>
                  <a href="#ai-converters" className="hover:text-white transition-colors">
                    Omni-Format converter
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2">
              <h4 className="font-mono text-[9px] text-[#F5F2ED] tracking-widest uppercase font-bold">
                Technical Disclaimer
              </h4>
              <p className="text-[10px] text-[#F5F2ED]/40 leading-normal">
                medki is an independent study tool designed for medical school preparation. Anki is a registered trademark of its respective owners. No official endorsement implied.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
            <span>
              &copy; {new Date().getFullYear()} medki. All rights reserved. Built for future physicians.
            </span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Privacy policy
              </a>
              <span>&bull;</span>
              <a href="#" className="hover:text-white transition-colors">
                Terms of service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
