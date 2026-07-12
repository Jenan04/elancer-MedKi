'use client';

import { useAuthUser } from '@/hooks/useAuthUser';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Deck {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalCards: number;
  dueCards: number;
  deadline?: string;
  createdAt: string;
}


export default function DecksPage() {
  const { user, isAuth, isLoading } = useAuthUser();
 const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDeadline, setNewDeckDeadline] = useState("");

  const stats = { streakCount: 5, dueCardsCount: 24 };

  const [myDecks, setMyDecks] = useState<Deck[]>([
    {
      id: "1",
      slug: "cardiovascular-system",
      title: "Cardiovascular System Pathology",
      description: "Myocardial infarction, valvular heart diseases, and hypertension mechanisms.",
      totalCards: 120,
      dueCards: 14,
      deadline: "2026-07-20",
      createdAt: "2026-07-01",
    },
    {
      id: "2",
      slug: "pharmacology-antibiotics",
      title: "Antibiotics & Pharmacology",
      description: "Mechanism of action for Penicillins, Cephalosporins, and Macrolides.",
      totalCards: 85,
      dueCards: 10,
      deadline: "2026-07-25",
      createdAt: "2026-07-05",
    }
  ]);

  // Show skeleton while we have no data at all
  if (isLoading && !user) {
    return <DecksPageSkeleton />;
  }

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    const slug = newDeckTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const newDeck: Deck = {
      id: Date.now().toString(),
      slug: slug,
      title: newDeckTitle,
      description: "Custom generated workspace deck.",
      totalCards: 0,
      dueCards: 0,
      deadline: newDeckDeadline || undefined,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setMyDecks([...myDecks, newDeck]);
    setIsModalOpen(false);
    setNewDeckTitle("");
    setNewDeckDeadline("");

    router.push(`/decks/${slug}`);
  };
  // Data is here (from localStorage seed or API) — render immediately
  if (user) {
    return (
     
      <div className="space-y-10 animate-fade-in relative">
      
      {/* 📊 Dashboard Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#A89F91]/20">
        <div>
          <h1 className="font-caslon text-3xl md:text-4xl font-bold text-[#1A1A1A]">My Study Decks</h1>
          <p className="font-grotesk text-sm text-[#1A1A1A]/60 mt-1">Manage your medical decks or create spaces to input files.</p>
        </div>
        
         <div className="flex items-center gap-4">
          <div className="bg-[#1A1A1A]/5 border border-[#A89F91]/25 rounded-2xl px-5 py-3 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/40">Current Streak</p>
              <p className="font-grotesk text-base font-bold text-[#1A1A1A]">{user?.stats?.streakCount ?? 0} Days</p>
            </div>
          </div>

          <div className="bg-[#D44D44]/5 border border-[#D44D44]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#D44D44]/60">Due Today</p>
              <p className="font-grotesk text-base font-bold text-[#D44D44]">{user?.stats?.dueCardsCount ?? 0} Cards</p>
            </div>
          </div>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myDecks.map((deck) => (
          <div 
            key={deck.id}
            className="group relative bg-[#F5F2ED] border border-[#A89F91]/30 hover:border-[#D44D44]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px]"
          >
             <div className="cursor-pointer" onClick={() => router.push(`/decks/${deck.slug}`)}>
               <div className="flex items-center justify-between mb-4">
                 <span className="text-[11px] font-mono text-[#1A1A1A]/40">{deck.totalCards} cards</span>
                 {deck.dueCards > 0 ? (
                   <span className="bg-[#D44D44] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                     {deck.dueCards} Due
                   </span>
                 ) : (
                   <span className="bg-emerald-500/10 text-emerald-700 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">Completed</span>
                 )}
               </div>

               <h3 className="font-caslon text-xl font-bold text-[#1A1A1A] group-hover:text-[#D44D44] transition-colors duration-200">
                 {deck.title}
               </h3>
               <p className="font-grotesk text-xs text-[#1A1A1A]/70 mt-2 line-clamp-2 leading-relaxed">
                 {deck.description}
               </p>
               {deck.deadline && (
                 <p className="text-[11px] font-mono text-[#D44D44] mt-3">⏳ Deadline: {deck.deadline}</p>
               )}
             </div>

             <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#A89F91]/15">
               <span className="text-[10px] font-mono text-[#1A1A1A]/30">Created: {deck.createdAt}</span>
              
               <Link 
                 href={`/decks/${deck.slug}/study`}
                 className="inline-flex items-center justify-center px-4 py-1.5 bg-[#1A1A1A] text-[#F5F2ED] group-hover:bg-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors duration-200"
               >
                 Study Now
               </Link>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
           className="border-2 border-dashed border-[#A89F91]/40 hover:border-[#D44D44] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] group transition-colors duration-300 bg-[#1A1A1A]/[0.01]"
         >
           <div className="w-10 h-10 rounded-full bg-[#1A1A1A]/5 group-hover:bg-[#D44D44]/10 flex items-center justify-center mb-3 transition-colors">
             <svg className="w-5 h-5 text-[#1A1A1A]/60 group-hover:text-[#D44D44] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
           </div>
           <p className="font-grotesk text-sm font-bold text-[#1A1A1A]">Add New Deck</p>
           <p className="font-grotesk text-xs text-[#1A1A1A]/50 mt-1 max-w-[200px]">Create an empty desk structure to start building flashcards.</p>
         </button>
       </div>

       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop animate-fade-in">
           <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 overflow-hidden transform transition-all scale-100">
             <div className="flex items-center justify-between pb-4 border-b border-[#A89F91]/15">
               <h2 className="font-caslon text-xl font-bold text-[#1A1A1A]">Create New Study Deck</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-lg font-mono">✕</button>
             </div>

             <form onSubmit={handleCreateDeck} className="mt-4 space-y-4">
               <div>
                 <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Deck Title</label>
                 <input 
                   type="text" 
                   required
                   placeholder="e.g., Respiratory System Pathology"
                   value={newDeckTitle}
                   onChange={(e) => setNewDeckTitle(e.target.value)}
                   className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                 />
               </div>

               <div>
                 <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Target Deadline (Optional)</label>
                 <input 
                   type="date" 
                   value={newDeckDeadline}
                   onChange={(e) => setNewDeckDeadline(e.target.value)}
                   className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-mono text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                 />
               </div>

               <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#A89F91]/15">
                 <button 
                   type="submit"
                   className="px-5 py-2 bg-[#D44D44] text-white rounded-full text-xs font-bold font-grotesk hover:bg-[#D44D44]/90 transition-colors shadow-xs"
                 >
                   Create
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

     </div>
    );
  }

  return (
    <div className="p-8 text-center text-gray-500">
      <p>Session expired. <a href="/auth" className="text-blue-600 underline">Sign in again</a></p>
    </div>
  );
}

function StatCard({ label, value, accent }: {
  label: string; value: number; accent: string;
}) {
  return (
    <div className={`rounded-xl p-4 border-l-4 bg-white shadow-sm ${accent}`}>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function DecksPageSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="flex gap-4">
        <div className="h-20 w-36 bg-gray-200 rounded-xl" />
        <div className="h-20 w-36 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}