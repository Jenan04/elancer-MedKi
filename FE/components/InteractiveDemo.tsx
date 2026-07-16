"use client";

import React, { useState } from "react";

const SAMPLES = [
  {
    title: "Anatomy Lecture Notes",
    text: "The supraspinatus muscle originates at the supraspinated fossa of the scapula. It inserts at the greater tubercle of the humerus. It is responsible for initiating abduction of the arm (first 15 degrees), and is innervated by the suprascapular nerve.",
    cards: [
      { q: "What is the origin of the supraspinatus muscle?", a: "Supraspinous fossa of the scapula" },
      { q: "Where does the supraspinatus muscle insert?", a: "Greater tubercle of the humerus" },
      { q: "What is the primary action of the supraspinatus muscle?", a: "Initiates abduction of arm (first 15 degrees)" },
      { q: "Which nerve innervates the supraspinatus muscle?", a: "Suprascapular nerve" },
    ],
  },
  {
    title: "Pathology Summary",
    text: "Myasthenia gravis is an autoimmune disorder caused by autoantibodies against post-synaptic acetylcholine (ACh) receptors at the neuromuscular junction. It presents with fluctuating muscle weakness, ptosis, diplopia, and worsens with muscle use. Treatment includes acetylcholinesterase inhibitors (e.g., pyridostigmine).",
    cards: [
      { q: "What is the pathophysiological cause of Myasthenia Gravis?", a: "Autoantibodies against post-synaptic acetylcholine (ACh) receptors at the neuromuscular junction" },
      { q: "What are the common clinical presentations of Myasthenia Gravis?", a: "Fluctuating muscle weakness, ptosis, diplopia (worsens with muscle use)" },
      { q: "What class of medications is used for first-line symptomatic treatment of Myasthenia Gravis?", a: "Acetylcholinesterase inhibitors (e.g., pyridostigmine)" },
    ],
  },
];

export default function InteractiveDemo() {
  const [inputText, setInputText] = useState(SAMPLES[0].text);
  const [isConverting, setIsConverting] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Array<{ q: string; a: string }>>([]);
  const [showResult, setShowResult] = useState(false);

  const handleConvert = () => {
    setIsConverting(true);
    setShowResult(false);
    
    // Simulate clinical AI conversion delay
    setTimeout(() => {
      setIsConverting(false);
      // Find matching sample cards, or generate default cards
      const matched = SAMPLES.find((s) => inputText.substring(0, 20) === s.text.substring(0, 20));
      if (matched) {
        setGeneratedCards(matched.cards);
      } else {
        // Fallback generic generation
        setGeneratedCards([
          { q: "Extracting main question from note...", a: "Generated key clinical answer details" },
          { q: "Verify anatomical correlations...", a: "Please verify against official textbook guidelines" },
        ]);
      }
      setShowResult(true);
    }, 1800);
  };

  const loadSample = (index: number) => {
    setInputText(SAMPLES[index].text);
    setShowResult(false);
    setGeneratedCards([]);
  };

  return (
    <section id="ai-converters" className="py-24 bg-white border-t border-[#A89F91]/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono text-[#D44D44] tracking-widest uppercase font-bold">
            Interactive Sandbox
          </span>
          <h2 className="font-caslon text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2 mb-4">
            Try the AI parser in real-time
          </h2>
          <div className="w-12 h-1 bg-[#D44D44] mx-auto rounded-full mb-4" />
          <p className="font-grotesk text-sm text-[#1A1A1A]/70">
            Paste raw text notes or select a clinical lecture template below. medki's parser isolates facts and outputs standard structured Anki CSV items.
          </p>
        </div>

        {/* Demo Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Input Playground */}
          <div className="lg:col-span-6 flex flex-col justify-between border border-[#A89F91]/25 rounded-2xl p-6 bg-[#F5F2ED]/25 shadow-xs">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F5F2ED] pb-3">
                <span className="text-xs font-mono font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Raw Clinical Asset
                </span>
                {/* Sample Buttons */}
                <div className="flex gap-2">
                  {SAMPLES.map((s, idx) => (
                    <button
                      key={s.title}
                      onClick={() => loadSample(idx)}
                      className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded bg-[#F5F2ED] hover:bg-[#D44D44]/10 hover:text-[#D44D44] transition-all border border-[#A89F91]/20 cursor-pointer"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your medical notes, definitions, or transcription transcripts here..."
                className="w-full h-64 bg-white border border-[#A89F91]/20 rounded-xl p-4 text-xs font-grotesk text-[#1A1A1A] focus:outline-none focus:border-[#D44D44] focus:ring-1 focus:ring-[#D44D44]/30 resize-none leading-relaxed"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-[#F5F2ED] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#A89F91]">
                Characters: {inputText.length}
              </span>
              <button
                onClick={handleConvert}
                disabled={isConverting || !inputText.trim()}
                className="px-6 py-3 bg-[#D44D44] hover:bg-[#D44D44]/95 disabled:bg-[#A89F91] text-white font-grotesk font-semibold text-xs rounded-md shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                {isConverting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Synthesizing...
                  </>
                ) : (
                  <>
                    Parse to Anki CSV
                    <span className="font-mono text-[9px] bg-white/20 px-1 rounded">➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output Preview */}
          <div className="lg:col-span-6 border border-[#A89F91]/25 rounded-2xl p-6 bg-white shadow-xs flex flex-col justify-between">
            <div className="space-y-4 w-full h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
                <span className="text-xs font-mono font-bold text-[#D44D44] uppercase tracking-wider">
                  Medki AI output
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-mono font-bold">
                  CSV Structured
                </span>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-center items-center h-64 overflow-y-auto">
                {isConverting ? (
                  <div className="text-center space-y-3 py-12">
                    <div className="flex justify-center gap-1.5 py-1">
                      <span className="w-2.5 h-2.5 bg-[#D44D44] rounded-full animate-bounce delay-0" />
                      <span className="w-2.5 h-2.5 bg-[#D44D44] rounded-full animate-bounce delay-75" />
                      <span className="w-2.5 h-2.5 bg-[#D44D44] rounded-full animate-bounce delay-150" />
                    </div>
                    <p className="text-[10px] font-mono text-[#A89F91] uppercase tracking-widest">
                      Resolving Anatomical Context
                    </p>
                  </div>
                ) : showResult ? (
                  <div className="w-full space-y-3 animate-fadeIn text-xs overflow-x-hidden">
                    <div className="max-h-60 overflow-y-auto border border-[#F5F2ED] rounded-xl">
                      <table className="min-w-full divide-y divide-[#F5F2ED] text-left">
                        <thead className="bg-[#F5F2ED] font-mono text-[9px] text-[#A89F91] uppercase">
                          <tr>
                            <th className="px-4 py-2">Front (Question)</th>
                            <th className="px-4 py-2">Back (Answer)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F2ED] font-grotesk text-[#1A1A1A] bg-white">
                          {generatedCards.map((c, i) => (
                            <tr key={i} className="hover:bg-[#F5F2ED]/30 transition-colors">
                              <td className="px-4 py-2.5 font-medium border-r border-[#F5F2ED]">{c.q}</td>
                              <td className="px-4 py-2.5 text-[#A89F91]">{c.a}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4 max-w-sm">
                    <div className="w-12 h-12 rounded-full bg-[#F5F2ED] flex items-center justify-center mx-auto text-[#A89F91]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-[#1A1A1A] uppercase tracking-wider">
                        Awaiting input conversion
                      </p>
                      <p className="text-[11px] font-grotesk text-[#A89F91] mt-1">
                        Select a template or type in raw notes, then click the parse button to run the AI processing stack.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-[#F5F2ED] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#A89F91]">
                Anki Format: CSV (UTF-8, comma separated)
              </span>
              <button
                disabled={!showResult}
                onClick={() => alert("CSV file downloaded successfully! Ready to import into Anki.")}
                className="px-4.5 py-2 border border-[#A89F91]/25 hover:border-[#D44D44] hover:text-[#D44D44] disabled:opacity-50 disabled:border-[#A89F91]/25 disabled:text-[#A89F91] text-xs font-mono font-bold text-[#1A1A1A] rounded-md transition-colors cursor-pointer"
              >
                📥 Download .CSV
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
