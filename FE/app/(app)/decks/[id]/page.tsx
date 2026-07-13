'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface Card {
  id: string;
  front: string;
  back: string;
}

interface DeckDetails {
  id: string;
  title: string;
  description: string;
  cards: Card[];
}

export default function DeckDetailsPage() {
  const { id: deckId } = useParams();
  const queryClient = useQueryClient();
  
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const token = Cookies.get('medki_token');
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const { data: deckResponse, isLoading } = useQuery<{ data: DeckDetails }>({
    queryKey: ['deck', deckId],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/decks/${deckId}`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });
      if (!res.ok) throw new Error('Failed to fetch deck details');
      return res.json();
    },
    enabled: !!deckId,
  });

  const addCardMutation = useMutation({
    mutationFn: async (newCard: { front: string; back: string }) => {
      const res = await fetch(`${baseUrl}/decks/${deckId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(newCard),
      });
      if (!res.ok) throw new Error('Failed to add card');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
      setIsManualModalOpen(false);
      setCardFront('');
      setCardBack('');
    }
  });

  const uploadCsvMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file); 

      const res = await fetch(`${baseUrl}/decks/${deckId}/cards/import`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to import CSV');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
      setIsCsvModalOpen(false);
      setCsvFile(null);
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;
    addCardMutation.mutate({ front: cardFront, back: cardBack });
  };

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    uploadCsvMutation.mutate(csvFile);
  };

  if (isLoading) return <div className="p-8 text-center">Loading deck...</div>;

  const deck = deckResponse?.data;
  const cards = deck?.cards || [];

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#A89F91]/20">
        <div>
          <h1 className="font-caslon text-3xl font-bold text-[#1A1A1A]">{deck?.title}</h1>
          <p className="font-grotesk text-sm text-[#1A1A1A]/60 mt-1">{deck?.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors duration-200 flex items-center gap-2"
          >
            ➕ Add Card
          </button>
          
          <button 
            onClick={() => setIsCsvModalOpen(true)}
            className="px-4 py-2 bg-[#F5F2ED] text-[#1A1A1A] border border-[#A89F91]/40 hover:border-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors duration-200 flex items-center gap-2"
          >
            📤 Import CSV
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-caslon text-xl font-bold text-[#1A1A1A] mb-4">Flashcards ({cards.length})</h2>
        
        {cards.length === 0 ? (
          <div className="border-2 border-dashed border-[#A89F91]/30 rounded-2xl p-12 text-center text-[#1A1A1A]/50">
            No cards in this deck yet. Click "Add Card" or upload a CSV to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="bg-[#F5F2ED] border border-[#A89F91]/30 rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#1A1A1A]/40 block mb-1">Front</span>
                  <p className="font-grotesk text-sm font-bold text-[#1A1A1A]">{card.front}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#A89F91]/15">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#D44D44] block mb-1">Back / Answer</span>
                  <p className="font-grotesk text-xs text-[#1A1A1A]/80">{card.back}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-sm">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#A89F91]/15">
              <h3 className="font-caslon text-lg font-bold">Add New Flashcard</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-sm font-mono">✕</button>
            </div>
            <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#1A1A1A]/60 mb-1">Front Side (Question / Concept)</label>
                <textarea 
                  required
                  rows={2}
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  placeholder="e.g., What is the primary function of Mitochondria?"
                  className="w-full px-3 py-2 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#1A1A1A]/60 mb-1">Back Side (Answer / Definition)</label>
                <textarea 
                  required
                  rows={3}
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  placeholder="e.g., Cellular respiration and ATP production."
                  className="w-full px-3 py-2 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#A89F91]/15">
                <button 
                  type="submit" 
                  disabled={addCardMutation.isPending}
                  className="px-5 py-2 bg-[#D44D44] text-white rounded-full text-xs font-bold disabled:opacity-50"
                >
                  {addCardMutation.isPending ? 'Saving...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-sm">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#A89F91]/15">
              <h3 className="font-caslon text-lg font-bold">Import Cards via CSV</h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-sm font-mono">✕</button>
            </div>
            <form onSubmit={handleCsvSubmit} className="mt-4 space-y-4">
              <div className="p-6 border-2 border-dashed border-[#A89F91]/40 rounded-xl bg-[#1A1A1A]/[0.02] text-center">
                <input 
                  type="file" 
                  accept=".csv"
                  required
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1A1A1A] file:text-white hover:file:bg-[#D44D44] cursor-pointer"
                />
                <p className="text-[11px] text-[#1A1A1A]/40 mt-3 font-mono">
                  Make sure your CSV has columns: <span className="font-bold text-[#D44D44]">front, back</span>
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#A89F91]/15">
                <button 
                  type="submit" 
                  disabled={uploadCsvMutation.isPending}
                  className="px-5 py-2 bg-[#1A1A1A] text-white hover:bg-[#D44D44] rounded-full text-xs font-bold disabled:opacity-50"
                >
                  {uploadCsvMutation.isPending ? 'Importing...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}