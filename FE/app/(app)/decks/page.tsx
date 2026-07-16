'use client';

import { useAuthUser } from '@/hooks/useAuthUser';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface Deck {
  id: string;
  title: string;
  description: string;
  user_id: string; 
  cards_count?: number;
  cardsCount?: number;
  pivot?: {
    deadline?: string;
  };
  creator?: {      
    id: string;
    name: string;
  };
  created_at: string;
}

export default function DecksPage() {
  const { user, isLoading: isUserLoading } = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false); // مودال مخصص لتحديث الديدلاين للمشتركين
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [deckForm, setDeckForm] = useState({ id: "", title: "", description: "", deadline: "" });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: decksResponse, isLoading: isDecksLoading } = useQuery<{ data: Deck[] }>({
    queryKey: ['decks'],
    queryFn: async () => {
      const token = Cookies.get('medki_token');
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

      const res = await fetch(`${baseUrl}/decks`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to fetch decks');
      }
      return res.json();
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const createDeckMutation = useMutation({
    mutationFn: async (newDeck: { title: string; deadline?: string }) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newDeck),
      });
      if (!res.ok) throw new Error('Failed to create deck');
      return res.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setIsCreateModalOpen(false);
      setDeckForm({ id: "", title: "", description: "", deadline: "" });
      toast.success('Deck created successfully');
      router.push(`/decks/${response.data.id}`);
    }
  });

  const updateDeckMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; deadline?: string }) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/decks/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: data.title, deadline: data.deadline }),
      });
      if (!res.ok) throw new Error('Failed to update deck');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setIsEditModalOpen(false);
      setDeckForm({ id: "", title: "", description: "", deadline: "" });
      toast.success('Deck details updated');
    }
  });

  const updateDeadlineMutation = useMutation({
    mutationFn: async (data: { id: string; deadline: string }) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/decks/${data.id}/deadline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deadline: data.deadline }),
      });
      if (!res.ok) throw new Error('Failed to update deadline');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setIsDeadlineModalOpen(false);
      setDeckForm({ id: "", title: "", description: "", deadline: "" });
      toast.success('Your deadline has been updated');
    },
    onError: () => {
      toast.error('Could not update deadline. Make sure it is a future date.');
    }
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/decks/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete deck');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      toast.success('Deck removed successfully');
    }
  });

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckForm.title.trim()) return;
    createDeckMutation.mutate({
      title: deckForm.title,
      deadline: deckForm.deadline || undefined
    });
  };

  const handleUpdateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckForm.title.trim() || !deckForm.id) return;
    updateDeckMutation.mutate({
      id: deckForm.id,
      title: deckForm.title,
      deadline: deckForm.deadline || undefined
    });
  };

  const handleUpdateDeadlineOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckForm.deadline || !deckForm.id) return;
    updateDeadlineMutation.mutate({
      id: deckForm.id,
      deadline: deckForm.deadline
    });
  };

  const openEditModal = (deck: Deck) => {
    const formattedDeadline = deck.pivot?.deadline ? deck.pivot.deadline.split('T')[0] : "";
    setDeckForm({
      id: deck.id,
      title: deck.title,
      description: deck.description || "",
      deadline: formattedDeadline
    });
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
  };

  const openDeadlineModal = (deck: Deck) => {
    const formattedDeadline = deck.pivot?.deadline ? deck.pivot.deadline.split('T')[0] : "";
    setDeckForm({
      id: deck.id,
      title: deck.title,
      description: deck.description || "",
      deadline: formattedDeadline
    });
    setIsDeadlineModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleDeleteDeck = (id: string) => {
    setActiveDropdownId(null);

    toast.warning('Are you sure you want to delete this deck?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => deleteDeckMutation.mutate(id),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.dismiss(),
      }
    });
  };

  if (isUserLoading) return <DecksPageSkeleton />;

  if (!user) return (
    <div className="p-8 text-center text-gray-500">
      <p>Session expired. <a href="/auth" className="text-blue-600 underline">Sign in again</a></p>
    </div>
  );

  if (isDecksLoading) return <DecksPageSkeleton />;

  const myDecks = decksResponse?.data || [];

  return (
    <div className="space-y-10 animate-fade-in relative" ref={dropdownRef}>

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
        {myDecks.map((deck) => {
          const deadline = deck.pivot?.deadline;
          const totalCards = deck.cards_count ?? deck.cardsCount ?? 0;
          const isOwner = deck.user_id === user.id; // التحقق هل المستخدم الحالي هو صانع الديسك

          return (
            <div
              key={deck.id}
              className="group relative bg-[#F5F2ED] border border-[#A89F91]/30 hover:border-[#D44D44]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute top-5 right-4 z-10">
                <button
                  onClick={() => setActiveDropdownId(activeDropdownId === deck.id ? null : deck.id)}
                  className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] p-1 rounded-full hover:bg-[#1A1A1A]/5 transition-colors text-lg font-bold"
                >
                  ⋮
                </button>

                {activeDropdownId === deck.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-[#F5F2ED] border border-[#A89F91]/30 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/decks/${deck.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Share link copied to clipboard!');
                            setActiveDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-grotesk font-semibold text-[#1A1A1A]/80 hover:bg-[#1A1A1A]/5 transition-colors flex items-center gap-2"
                        >
                          🔗 Share
                        </button>
                        <button
                          onClick={() => openEditModal(deck)}
                          className="w-full text-left px-4 py-2 text-xs font-grotesk font-semibold text-[#1A1A1A]/80 hover:bg-[#1A1A1A]/5 transition-colors flex items-center gap-2"
                        >
                          ✏️ Rename
                        </button>
                        <button
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="w-full text-left px-4 py-2 text-xs font-grotesk font-semibold text-[#D44D44] hover:bg-[#D44D44]/5 transition-colors flex items-center gap-2"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openDeadlineModal(deck)}
                        className="w-full text-left px-4 py-2 text-xs font-grotesk font-semibold text-[#1A1A1A]/80 hover:bg-[#1A1A1A]/5 transition-colors flex items-center gap-2"
                      >
                        📅 Set Deadline
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="cursor-pointer pr-4" onClick={() => router.push(`/decks/${deck.id}`)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono text-[#1A1A1A]/40">{totalCards} cards</span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${isOwner ? 'bg-emerald-500/10 text-emerald-700' : 'bg-blue-500/10 text-blue-700'}`}>
                    {isOwner ? 'Owner' : 'Subscribed'}
                  </span>
                </div>

                <h3 className="font-caslon text-xl font-bold text-[#1A1A1A] group-hover:text-[#D44D44] transition-colors duration-200">
                  {deck.title}
                </h3>
                <p className="font-grotesk text-xs text-[#1A1A1A]/70 mt-2 line-clamp-2 leading-relaxed">
                  {deck.description || "No description provided."}
                </p>
                {deadline && (
                  <p className="text-[11px] font-mono text-[#D44D44] mt-3">⏳ Deadline: {new Date(deadline).toLocaleDateString()}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#A89F91]/15">
                {/* إظهار اسم منشئ الديسك بشكل مخصص بالأسفل */}
                <span className="text-[10px] font-mono text-[#1A1A1A]/40">
                  Created by: {isOwner ? 'Me' : (deck.creator?.name || 'Shared User')}
                </span>

                <Link
                  href={`/decks/${deck.id}/study`}
                  className="inline-flex items-center justify-center px-4 py-1.5 bg-[#1A1A1A] text-[#F5F2ED] group-hover:bg-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors duration-200"
                >
                  Study Now
                </Link>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => {
            setDeckForm({ id: "", title: "", description: "", deadline: "" });
            setIsCreateModalOpen(true);
          }}
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-sm animate-fade-in">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 overflow-hidden transform transition-all scale-100">
            <div className="flex items-center justify-between pb-4 border-b border-[#A89F91]/15">
              <h2 className="font-caslon text-xl font-bold text-[#1A1A1A]">Create New Study Deck</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-lg font-mono">✕</button>
            </div>

            <form onSubmit={handleCreateDeck} className="mt-4 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Deck Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Respiratory System Pathology"
                  value={deckForm.title}
                  onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={deckForm.deadline}
                  onChange={(e) => setDeckForm({ ...deckForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-mono text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#A89F91]/15">
                <button
                  type="submit"
                  disabled={createDeckMutation.isPending}
                  className="px-5 py-2 bg-[#D44D44] text-white rounded-full text-xs font-bold font-grotesk hover:bg-[#D44D44]/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {createDeckMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-sm animate-fade-in">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 overflow-hidden transform transition-all scale-100">
            <div className="flex items-center justify-between pb-4 border-b border-[#A89F91]/15">
              <h2 className="font-caslon text-xl font-bold text-[#1A1A1A]">Rename / Update Deck</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-lg font-mono">✕</button>
            </div>

            <form onSubmit={handleUpdateDeck} className="mt-4 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Deck Title</label>
                <input
                  type="text"
                  required
                  value={deckForm.title}
                  onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={deckForm.deadline}
                  onChange={(e) => setDeckForm({ ...deckForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-mono text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#A89F91]/15">
                <button
                  type="submit"
                  disabled={updateDeckMutation.isPending}
                  className="px-5 py-2 bg-[#1A1A1A] text-white rounded-full text-xs font-bold font-grotesk hover:bg-[#1A1A1A]/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {updateDeckMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeadlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-sm animate-fade-in">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 overflow-hidden transform transition-all scale-100">
            <div className="flex items-center justify-between pb-4 border-b border-[#A89F91]/15">
              <h2 className="font-caslon text-xl font-bold text-[#1A1A1A]">Set Personal Deadline</h2>
              <button onClick={() => setIsDeadlineModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-lg font-mono">✕</button>
            </div>

            <form onSubmit={handleUpdateDeadlineOnly} className="mt-4 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">Your Personal Target Deadline</label>
                <input
                  type="date"
                  required
                  value={deckForm.deadline}
                  onChange={(e) => setDeckForm({ ...deckForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-mono text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D44] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#A89F91]/15">
                <button
                  type="submit"
                  disabled={updateDeadlineMutation.isPending}
                  className="px-5 py-2 bg-[#D44D44] text-white rounded-full text-xs font-bold font-grotesk hover:bg-[#D44D44]/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {updateDeadlineMutation.isPending ? 'Updating...' : 'Update Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function DecksPageSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-[#A89F91]/20 rounded" />
      <div className="flex gap-4">
        <div className="h-20 w-36 bg-[#A89F91]/25 rounded-xl" />
        <div className="h-20 w-36 bg-[#A89F91]/25 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="h-48 bg-[#A89F91]/15 rounded-2xl" />
        <div className="h-48 bg-[#A89F91]/15 rounded-2xl" />
        <div className="h-48 bg-[#A89F91]/15 rounded-2xl" />
      </div>
    </div>
  );
}