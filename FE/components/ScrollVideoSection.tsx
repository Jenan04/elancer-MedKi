"use client";

import React, { useEffect, useRef, useState } from "react";
import FlashcardWidget from "./FlashcardWidget";

export default function ScrollVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let rafId: number;

    const updateSeek = () => {
      const rect = container.getBoundingClientRect();
      const totalHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Scrollable range for the 300vh section inside the viewport
      const scrollRange = totalHeight - viewportHeight;
      if (scrollRange <= 0) return;

      const scrolled = -rect.top;
      const progress = scrolled / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, progress));

      setScrollProgress(clampedProgress);

      // Seek video to corresponding playhead (video is exactly 7 seconds long)
      const duration = video.duration || 7;
      video.currentTime = duration * clampedProgress;
    };

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateSeek);
    };

    const onVideoMetadata = () => {
      setIsVideoReady(true);
      updateSeek();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    video.addEventListener("loadedmetadata", onVideoMetadata);
    
    // Initial check
    if (video.readyState >= 1) {
      setIsVideoReady(true);
      updateSeek();
    } else {
      updateSeek();
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadedmetadata", onVideoMetadata);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#F5F2ED]"
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#F5F2ED]">
        
        {/* Subtle grid pattern background for clinical vibe */}
        <div className="absolute inset-0 bg-[radial-gradient(#A89F91_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-0" />

        {/* FULL BACKGROUND VIDEO - Connected directly to Scroll Animation */}
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-10">
          <video
            ref={videoRef}
            src="/videos/muscle-growth.mp4"
            preload="auto"
            muted
            playsInline
            className="w-full h-full object-cover mix-blend-multiply opacity-80 transition-all duration-300"
          />

          {/* Smooth Edge Blend Overlay (Vignette) over the full background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F5F2ED] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F2ED] to-transparent" />
            <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#F5F2ED] to-transparent" />
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#F5F2ED] to-transparent" />
          </div>

          {/* Preloader centered inside the section */}
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F5F2ED]/90 z-50 pointer-events-auto">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-[#D44D44]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs font-mono text-[#A89F91] tracking-widest uppercase">Preloading Video...</span>
              </div>
            </div>
          )}
        </div>

        {/* Foreground Content Container - Placed neatly on top of the video */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
          
          {/* Left Column: Copywriting & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-center lg:text-left pt-16 lg:pt-0 backdrop-blur-[2px] lg:backdrop-blur-none bg-[#F5F2ED]/40 lg:bg-transparent p-6 rounded-2xl lg:p-0">
            <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1 rounded-full border border-[#D44D44]/20 bg-[#D44D44]/5 text-[#D44D44] font-mono text-[10px] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D44D44] animate-ping" />
              Spaced Repetition V2
            </div>

            <h1 className="font-caslon text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-[1.1]">
              MEDKI: Watch the <span className="text-[#D44D44]">body build itself</span>, card by card.
            </h1>

            <p className="font-grotesk text-sm sm:text-base text-[#1A1A1A]/80 leading-relaxed max-w-lg mx-auto lg:mx-0">
              The ultimate medical study engine. medki supercharges your Anki spaced-repetition workflow by introducing advanced AI-driven utility pipelines built exclusively for medical students.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#convert"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#D44D44] hover:bg-[#D44D44]/95 text-white font-grotesk font-semibold rounded-md shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
              >
                Convert Your First File
              </a>
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-[#1A1A1A]/20 hover:border-[#D44D44] text-[#1A1A1A] hover:text-[#D44D44] font-grotesk font-semibold rounded-md transition-all duration-300 hover:bg-[#D44D44]/5"
              >
                Watch Interactive Demo
              </a>
            </div>

            {/* Scroll Indicator */}
            <div className="hidden lg:flex items-center gap-3 pt-8 text-[11px] font-mono text-[#A89F91]">
              <div className="w-10 h-[1px] bg-[#A89F91]/35 relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#D44D44] transition-all duration-100"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <span>Scroll to build muscle system ({Math.round(scrollProgress * 100)}%)</span>
            </div>
          </div>

          {/* Right Column: Floating Flashcard Widgets directly over the background */}
          <div className="lg:col-span-6 relative h-[40vh] lg:h-full w-full flex items-center justify-center select-none pointer-events-none">
            
            {/* Absolute Floating Flashcards */}
            {/* Card 1: Top-Right */}
            <div
              className="absolute top-4 right-0 md:right-4 z-30 scale-85 md:scale-95 transition-all duration-700 pointer-events-auto"
              style={{
                transform: `translateY(${Math.sin(scrollProgress * Math.PI) * -15}px) rotate(${3 + Math.sin(scrollProgress * Math.PI) * 2}deg)`,
                opacity: scrollProgress > 0.05 ? 1 : 0.8,
              }}
            >
              <FlashcardWidget
                deck="medki::Anatomy::UpperLimbs"
                question="What muscle is primarily responsible for arm abduction beyond 15 degrees?"
                answer="Deltoid Muscle\n\n• Origin: Lateral clavicle, acromion, spine of scapula\n• Insertion: Deltoid tuberosity of humerus\n• Action: Abducts arm beyond 15° (initial 15° by Supraspinatus)"
                meta="Card #112 • Anatomy"
              />
            </div>

            {/* Card 2: Bottom-Left */}
            <div
              className="absolute bottom-4 left-0 md:left-4 z-30 scale-85 md:scale-95 transition-all duration-700 pointer-events-auto"
              style={{
                transform: `translateY(${Math.cos(scrollProgress * Math.PI) * 15}px) rotate(${-3 + Math.cos(scrollProgress * Math.PI) * -2}deg)`,
                opacity: scrollProgress > 0.3 ? 1 : 0.6,
              }}
            >
              <FlashcardWidget
                deck="medki::Anatomy::Trunk"
                question="Identify the origin and action of the Pectoralis Major muscle."
                answer="Pectoralis Major\n\n• Origin: Clavicular head, sternocostal head\n• Insertion: Lateral lip of bicipital groove of humerus\n• Action: Adducts and medially rotates humerus"
                meta="Card #88 • Kinesiology"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}