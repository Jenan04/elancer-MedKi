'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Card {
  id: string;
  front: string; 
  back: string;  
  userRating?: 'again' | 'hard' | 'good' | 'easy'; 
}

interface DeckResponse {
  id: string;
  title: string;
  cards: Card[];
}

export default function StudyDeckPage() {
  const { id: deckId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>([]);

  const { data: deck, isLoading } = useQuery<DeckResponse>({
    queryKey: ["deck-study", deckId],
    queryFn: async () => {
      const token = Cookies.get("medki_token");
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/decks/${deckId}`, {
        headers: {
          "Accept": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch deck");
      const result = await res.json();
      return result.data;
    },
  });

  useEffect(() => {
    if (deck?.cards) {
      setLocalCards(deck.cards);
    }
  }, [deck]);

  const rateCardMutation = useMutation({
    mutationFn: async ({ cardId, rating }: { cardId: string; rating: string }) => {
      const token = Cookies.get("medki_token");
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/cards/${cardId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed to submit rating");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deck-study", deckId] });

      if (data.deck_completed) {
        if (data.streak_updated) {
          toast.success(`🔥 مذهل! لقد حافظت على الستريك لليوم! الستريك الحالي: ${data.current_streak} أيام متتالية!`, {
            duration: 6000,
          });
        } else {
          toast.success("🎉 أحسنت! لقد أنهيت مراجعة كافة كروت هذا الديسك بنجاح.");
        }
      }
    },
    onError: () => {
      toast.error("Could not sync rating with server.");
    }
  });

  if (isLoading) return <StudyPageSkeleton />;

  if (!localCards || localCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-[#F5F2ED] border border-[#A89F91]/25 rounded-2xl max-w-lg mx-auto mt-12 animate-fade-in">
        <span className="text-4xl mb-4">📭</span>
        <h2 className="font-caslon text-xl font-bold text-[#1A1A1A]">No Cards in this Deck</h2>
        <p className="font-grotesk text-xs text-[#1A1A1A]/60 mt-1 max-w-xs">You need to add some cards first before you can start practicing.</p>
        <button 
          onClick={() => router.push(`/decks/${deckId}`)}
          className="mt-6 px-5 py-2 bg-[#1A1A1A] text-white rounded-full text-xs font-bold font-grotesk hover:bg-[#D44D44] transition-colors"
        >
          Go Back to Deck
        </button>
      </div>
    );
  }

  const currentCard = localCards[currentIndex];

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const updated = [...localCards];
    updated[currentIndex] = { ...currentCard, userRating: rating };
    setLocalCards(updated);

    rateCardMutation.mutate({ cardId: currentCard.id, rating });

    setTimeout(() => {
      if (currentIndex < localCards.length - 1) {
        setFlipped(false);
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentIndex < localCards.length - 1) {
      setFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-12 px-6 animate-fade-in">
      
      <div className="flex items-center justify-end max-w-2xl mx-auto">
        <span className="font-mono text-xs bg-[#1A1A1A]/5 px-3 py-1.5 rounded-full border border-[#A89F91]/20">
          Card <span className="font-bold text-[#D44D44]">{currentIndex + 1}</span> of {localCards.length}
        </span>
      </div>

      <div className="flex justify-center">
        <div
          className="relative w-full max-w-2xl h-96 cursor-pointer group perspective-1000 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border border-[#A89F91]/25 bg-[#F5F2ED] p-8 flex flex-col justify-between shadow-sm select-none">
              <div className="flex items-center justify-between border-b border-[#A89F91]/10 pb-4">
                <span className="text-[11px] font-mono text-[#1A1A1A]/40 tracking-wider uppercase">
                  {deck?.title || "medki::study"}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#D44D44] animate-pulse" />
              </div>

              <div className="my-auto text-center py-6 px-4">
                <p className="text-xl md:text-2xl font-grotesk text-[#1A1A1A] font-medium leading-relaxed">
                  {currentCard?.front}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#A89F91]/10 pt-4">
                <span className="text-[10px] font-mono text-[#A89F91]">
                  Card #{currentIndex + 1} • Spaced Repetition Active
                </span>
                <span className="text-[11px] font-mono font-bold text-[#D44D44] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Reveal Answer
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border border-[#D44D44]/30 bg-[#F5F2ED] p-8 flex flex-col justify-between shadow-md select-none">
              <div className="flex items-center justify-between border-b border-[#A89F91]/10 pb-3">
                <span className="text-[11px] font-mono text-[#D44D44] tracking-wider uppercase font-semibold">
                  Correct Answer
                </span>
                <span className="text-[10px] font-mono text-[#A89F91]">Set Interval</span>
              </div>

              <div className="my-auto overflow-y-auto pr-2 max-h-40 scrollbar-none py-4 text-center">
                <p className="text-base md:text-lg font-grotesk text-[#1A1A1A] leading-relaxed whitespace-pre-line px-4">
                  {currentCard?.back}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[#A89F91]/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate('again');
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                    currentCard?.userRating === 'again' 
                      ? 'bg-red-600 border-red-600 text-white shadow-xs' 
                      : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                  }`}
                >
                  Again
                  <span className={`block text-[9px] font-normal mt-0.5 ${currentCard?.userRating === 'again' ? 'text-white/80' : 'text-red-400'}`}>1m</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate('hard');
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                    currentCard?.userRating === 'hard' 
                      ? 'bg-[#A89F91] border-[#A89F91] text-[#F5F2ED] shadow-xs' 
                      : 'bg-white hover:bg-[#A89F91]/10 border-[#A89F91]/30 text-[#1A1A1A]/70'
                  }`}
                >
                  Hard
                  <span className={`block text-[9px] font-normal mt-0.5 ${currentCard?.userRating === 'hard' ? 'text-white/80' : 'text-[#A89F91]'}`}>12h</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate('good');
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                    currentCard?.userRating === 'good' 
                      ? 'bg-zinc-700 border-zinc-700 text-white shadow-xs' 
                      : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  Good
                  <span className={`block text-[9px] font-normal mt-0.5 ${currentCard?.userRating === 'good' ? 'text-white/80' : 'text-zinc-400'}`}>2.4d</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate('easy');
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                    currentCard?.userRating === 'easy' 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                  }`}
                >
                  Easy
                  <span className={`block text-[9px] font-normal mt-0.5 ${currentCard?.userRating === 'easy' ? 'text-white/80' : 'text-emerald-400'}`}>6.2d</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 max-w-2xl mx-auto">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#A89F91]/30 hover:border-[#1A1A1A] disabled:opacity-30 disabled:hover:border-[#A89F91]/30 rounded-full text-xs font-grotesk font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
        >
          ← Prev Card
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === localCards.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#A89F91]/30 hover:border-[#1A1A1A] disabled:opacity-30 disabled:hover:border-[#A89F91]/30 rounded-full text-xs font-grotesk font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
        >
          Next Card →
        </button>
      </div>

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

function StudyPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-12 px-6 animate-pulse">
      <div className="flex items-center justify-end max-w-2xl mx-auto">
        <div className="h-8 w-24 bg-[#A89F91]/20 rounded-full" />
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl h-96 bg-[#A89F91]/15 rounded-2xl" />
      </div>
      <div className="flex justify-between max-w-2xl mx-auto">
        <div className="h-10 w-28 bg-[#A89F91]/20 rounded-full" />
        <div className="h-10 w-28 bg-[#A89F91]/20 rounded-full" />
      </div>
    </div>
  );
}