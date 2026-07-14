'use client';

import React, { useState } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface DeckDetails {
  id: string;
  title: string;
  description: string;
  user_id: string; 
  creator?: {
    name: string;
  };
  is_subscribed: boolean; 
  cards: any[];
}

export default function DeckViewPage() {
  const { id } = useParams(); 
  const { user, isLoading: isUserLoading } = useAuthUser();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const { data: deck, isLoading: isDeckLoading } = useQuery<DeckDetails>({
    queryKey: ['deck', id],
    queryFn: async () => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/decks/${id}`, {
        headers: {
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load deck');
      return (await res.json()).data;
    },
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/decks/${id}/subscribe`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Subscription failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Deck added to your study list successfully!');
      queryClient.invalidateQueries({ queryKey: ['deck', id] });
      queryClient.invalidateQueries({ queryKey: ['decks'] }); 
    },
    onError: () => {
      toast.error('Something went wrong. Could not subscribe.');
    }
  });

  const addCardMutation = useMutation({
    mutationFn: async (newCard: { front: string; back: string }) => {
      const token = Cookies.get('medki_token'); 
      const res = await fetch(`${baseUrl}/decks/${id}/cards`, { 
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
      toast.success('Card added successfully!');
      queryClient.invalidateQueries({ queryKey: ['deck', id] }); 
      setIsManualModalOpen(false);
      setCardFront('');
      setCardBack('');
    },
    onError: () => {
      toast.error('Failed to add the card. Please try again.');
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;
    addCardMutation.mutate({ front: cardFront, back: cardBack });
  };

  if (isUserLoading || isDeckLoading) return <p className="p-8 text-center">Loading deck...</p>;
  if (!deck) return <p className="p-8 text-center">Deck not found.</p>;

  const isOwner = deck.user_id === user?.id;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 bg-[#F5F2ED] border border-[#A89F91]/30 rounded-2xl mt-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#A89F91]/20 pb-6 gap-4">
        <div>
          <h1 className="font-caslon text-3xl font-bold text-[#1A1A1A]">{deck.title}</h1>
          <p className="font-grotesk text-sm text-[#1A1A1A]/60 mt-1">{deck.description || 'No description provided.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {isOwner ? (
            <>
              <button 
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              >
                ➕ Add Card
              </button>
              <button 
                onClick={() => router.push(`/decks/${deck.id}/study`)}
                className="px-4 py-2 bg-[#D44D44] text-white rounded-xl text-xs font-bold font-grotesk hover:bg-[#D44D44]/90 transition-colors cursor-pointer"
              >
                📚 Study
              </button>
            </>
          ) : (
            <>
              {!deck.is_subscribed ? (
                <button 
                  onClick={() => subscribeMutation.mutate()}
                  disabled={subscribeMutation.isPending}
                  className="px-5 py-2.5 bg-[#D44D44] text-white rounded-xl text-xs font-bold font-grotesk hover:bg-[#D44D44]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  📥 {subscribeMutation.isPending ? 'Adding...' : 'Add to My Decks'}
                </button>
              ) : (
                <button 
                  onClick={() => router.push(`/decks/${deck.id}/study`)}
                  className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold font-grotesk hover:bg-[#1A1A1A]/90 transition-colors cursor-pointer"
                >
                  📖 Study This Deck
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-caslon text-xl font-bold text-[#1A1A1A]">Flashcards ({deck.cards?.length || 0})</h2>
        <div className="grid grid-cols-1 gap-3">
          {deck.cards?.map((card, idx) => (
            <div key={card.id} className="p-4 bg-[#1A1A1A]/5 rounded-xl border border-[#A89F91]/20">
              <p className="font-mono text-[11px] text-[#1A1A1A]/40 mb-1">Card #{idx + 1}</p>
              <p className="font-grotesk text-sm font-semibold text-[#1A1A1A]">{card.front}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-[#A89F91]/20 flex justify-between items-center text-xs font-mono text-[#1A1A1A]/40">
        <span>Created by: {isOwner ? 'Me' : (deck.creator?.name || 'Shared User')}</span>
        {!isOwner && deck.is_subscribed && (
          <span className="text-emerald-600 font-semibold">✓ Saved in your account</span>
        )}
      </div>

      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-blur-sm">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#A89F91]/15">
              <h3 className="font-caslon text-lg font-bold">Add New Flashcard</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-sm font-mono cursor-pointer">✕</button>
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
                  className="px-5 py-2 bg-[#D44D44] text-white rounded-full text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {addCardMutation.isPending ? 'Saving...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}  
    </div>
  );
}