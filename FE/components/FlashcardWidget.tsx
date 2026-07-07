"use client";

import React, { useState } from "react";

interface FlashcardProps {
  deck?: string;
  question: string;
  answer: string;
  meta?: string;
  delayClass?: string;
}

export default function FlashcardWidget({
  deck = "medki::Anatomy::Muscles",
  question,
  answer,
  meta = "Card #240 • Spaced Repetition Active",
  delayClass = "delay-0",
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`relative w-80 h-48 cursor-pointer group perspective-1000 ${delayClass} transition-all duration-500 hover:-translate-y-1 hover:shadow-lg`}
      onClick={() => setFlipped(!flipped)}
    >
      {/* 3D Card Inner Wrapper */}
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT OF THE CARD */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl border border-[#A89F91]/25 bg-white p-4.5 flex flex-col justify-between shadow-xs select-none">
          <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-2">
            <span className="text-[10px] font-mono text-[#A89F91] tracking-wider uppercase">
              {deck}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D44D44] animate-pulse" />
          </div>

          <div className="my-auto">
            <p className="text-sm font-grotesk text-[#1A1A1A] font-medium leading-relaxed">
              {question}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#F5F2ED] pt-2">
            <span className="text-[9px] font-mono text-[#A89F91]">
              {meta}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#D44D44] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Reveal Answer
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* BACK OF THE CARD */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl border border-[#D44D44]/30 bg-white p-4 flex flex-col justify-between shadow-sm select-none">
          <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-1.5">
            <span className="text-[10px] font-mono text-[#D44D44] tracking-wider uppercase font-semibold">
              Correct Answer
            </span>
            <span className="text-[9px] font-mono text-[#A89F91]">Anki Interval</span>
          </div>

          <div className="my-auto overflow-y-auto pr-1 max-h-20 scrollbar-none">
            <p className="text-xs font-grotesk text-[#1A1A1A] leading-relaxed whitespace-pre-line">
              {answer}
            </p>
          </div>

          {/* Anki Spaced Repetition Grading Actions */}
          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#F5F2ED]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="px-1 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-[10px] font-mono font-bold text-red-600 text-center transition-colors cursor-pointer"
            >
              Again
              <span className="block text-[8px] font-normal text-red-400">1m</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="px-1 py-1 rounded bg-[#F5F2ED] hover:bg-[#A89F91]/10 border border-[#A89F91]/20 text-[10px] font-mono font-bold text-[#A89F91] text-center transition-colors cursor-pointer"
            >
              Hard
              <span className="block text-[8px] font-normal text-[#A89F91]/65">12h</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="px-1 py-1 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-[10px] font-mono font-bold text-zinc-700 text-center transition-colors cursor-pointer"
            >
              Good
              <span className="block text-[8px] font-normal text-zinc-400">2.4d</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="px-1 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-700 text-center transition-colors cursor-pointer"
            >
              Easy
              <span className="block text-[8px] font-normal text-emerald-400">6.2d</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind 3D Utilities Injector */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
