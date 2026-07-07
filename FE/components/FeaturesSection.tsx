"use client";

import React, { useState } from "react";

export default function FeaturesSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="flashcards" className="py-24 bg-[#F5F2ED] border-t border-[#A89F91]/20 relative">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D44D44]/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A89F91]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono text-[#D44D44] tracking-widest uppercase font-bold">
            The Three Pillars of Medki
          </span>
          <h2 className="font-caslon text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mt-2 mb-4 leading-tight">
            Advanced medical learning pipelines
          </h2>
          <div className="w-12 h-1 bg-[#D44D44] mx-auto rounded-full mb-4" />
          <p className="font-grotesk text-sm sm:text-base text-[#1A1A1A]/70">
            Automate the friction of building study materials. Convert any standard clinical or lecture asset directly into optimized active recall assets.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: AI Omni-Format to CSV */}
          <div
            className="group relative rounded-2xl bg-white border border-[#A89F91]/20 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D44D44]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-[#D44D44]/5 flex items-center justify-center text-[#D44D44] mb-6 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h3 className="font-caslon text-xl font-bold text-[#1A1A1A] mb-3">
                AI Omni-Format to CSV
              </h3>
              <p className="font-grotesk text-xs sm:text-sm text-[#1A1A1A]/70 leading-relaxed mb-6">
                Instantly converts standard medical PDFs, docs, and notes into structured CSV files tailored for automatic flashcard deck creation.
              </p>
            </div>

            {/* Interactive Sandbox/Demo inside the card */}
            <div className="mt-auto pt-4 border-t border-[#F5F2ED] h-28 flex flex-col justify-center bg-[#F5F2ED]/40 rounded-lg p-3 overflow-hidden relative">
              {hoveredCard === 1 ? (
                <div className="space-y-2 animate-fadeIn text-[10px] font-mono">
                  <div className="flex items-center justify-between text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    <span className="truncate">✓ anatomy_lecture.pdf</span>
                    <span>Ready</span>
                  </div>
                  <div className="bg-[#1A1A1A] text-[#F5F2ED] p-1.5 rounded text-[8px] space-y-0.5 overflow-hidden max-h-12 border border-[#A89F91]/20">
                    <div>"Question","Answer","Deck"</div>
                    <div className="text-emerald-400">"What is the action of...","Flexion of...","Anatomy"</div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <span className="text-[10px] font-mono text-[#A89F91]">Hover to process mock file</span>
                  <div className="flex justify-center gap-1.5 text-xs text-[#A89F91]">
                    <span className="px-2 py-1 bg-white rounded border border-[#A89F91]/15">.PDF</span>
                    <span className="px-2 py-1 bg-white rounded border border-[#A89F91]/15">.DOCX</span>
                    <span className="px-2 py-1 bg-white rounded border border-[#A89F91]/15">➔ CSV</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: AI Handwriting-to-Text */}
          <div
            className="group relative rounded-2xl bg-white border border-[#A89F91]/20 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D44D44]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-[#D44D44]/5 flex items-center justify-center text-[#D44D44] mb-6 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>

              <h3 className="font-caslon text-xl font-bold text-[#1A1A1A] mb-3">
                AI Handwriting-to-Text
              </h3>
              <p className="font-grotesk text-xs sm:text-sm text-[#1A1A1A]/70 leading-relaxed mb-6">
                Transcription engine that converts handwritten lecture notes or physical paper text into digital <code className="bg-[#F5F2ED] px-1 rounded text-[11px] font-mono text-[#D44D44]">.txt</code> files.
              </p>
            </div>

            {/* Interactive Handwriting Simulator */}
            <div className="mt-auto pt-4 border-t border-[#F5F2ED] h-28 flex flex-col justify-center bg-[#F5F2ED]/40 rounded-lg p-3 overflow-hidden">
              {hoveredCard === 2 ? (
                <div className="space-y-1.5 animate-fadeIn text-[10px] font-mono">
                  <span className="text-[9px] text-[#A89F91]">TRANSCRIPTION PIPELINE:</span>
                  <div className="bg-[#1A1A1A] text-[#F5F2ED] p-2 rounded text-[8px] leading-normal font-mono border border-emerald-500/30">
                    <span className="text-emerald-400">OCR Output:</span> "Biceps tendon inserts on radial tuberosity..."
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <span className="text-[10px] font-mono text-[#A89F91]">Hover to scan handwriting</span>
                  <div className="flex justify-center items-center gap-2">
                    {/* Simulated hand writing style */}
                    <span className="font-serif italic text-sm tracking-wide text-[#A89F91]/70 line-through decoration-[#D44D44]">
                      Surg. incision notes...
                    </span>
                    <span className="text-xs text-[#A89F91]/50">➔</span>
                    <span className="font-mono text-xs text-[#1A1A1A] font-bold">
                      [Digital Text]
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: AI Voice-to-Text */}
          <div
            className="group relative rounded-2xl bg-white border border-[#A89F91]/20 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D44D44]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-[#D44D44]/5 flex items-center justify-center text-[#D44D44] mb-6 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>

              <h3 className="font-caslon text-xl font-bold text-[#1A1A1A] mb-3">
                AI Voice-to-Text
              </h3>
              <p className="font-grotesk text-xs sm:text-sm text-[#1A1A1A]/70 leading-relaxed mb-6">
                Converts audio recordings of medical lectures into clean text summaries. Users can use documents directly or convert them to flashcards.
              </p>
            </div>

            {/* Interactive Audio Waveform Simulator */}
            <div className="mt-auto pt-4 border-t border-[#F5F2ED] h-28 flex flex-col justify-center bg-[#F5F2ED]/40 rounded-lg p-3 overflow-hidden">
              {hoveredCard === 3 ? (
                <div className="space-y-2 animate-fadeIn text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 justify-center py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
                      <span
                        key={i}
                        className="w-1 bg-[#D44D44] rounded-full animate-wave"
                        style={{
                          height: `${Math.random() * 20 + 8}px`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[8px] text-[#A89F91] text-center font-mono truncate">
                    "Analyzing lecture audio... 88% confidence"
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <span className="text-[10px] font-mono text-[#A89F91]">Hover to simulate playback</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <span
                        key={i}
                        className="w-1 h-3 bg-[#A89F91]/35 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.7);
          }
          50% {
            transform: scaleY(1.4);
          }
        }
        .animate-wave {
          animation: wave 1.2s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
    </section>
  );
}
