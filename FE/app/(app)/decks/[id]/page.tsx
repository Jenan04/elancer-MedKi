'use client';

import React, { useState, useRef } from 'react';
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
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
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

  const { data: libraryFiles, isLoading: isFilesLoading } = useQuery({
    queryKey: ['user-files'],
    queryFn: async () => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/user/files`, {
        headers: {
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load files');
      return (await res.json()).data;
    },
    enabled: !!user && isLibraryModalOpen,
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

  const importFromLibraryMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/decks/${id}/import-from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ file_id: fileId }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Import failed.');
      }
      return res.json();
    },
    onMutate: () => {
      return toast.loading('Importing from Medki Library...');
    },
    onSuccess: (data, variables, toastId) => {
      toast.success('Flashcards imported from Medki Library! 🚀', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['deck', id] });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setIsLibraryModalOpen(false);
    },
    onError: (error: any, variables, toastId) => {
      toast.error(error.message || 'Something went wrong.', { id: toastId });
    }
  });

  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await importCsvFile(file);
    }
  };

  const handleCsvSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importCsvFile(file);
    }
  };

  const importCsvFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a valid CSV file.');
      return;
    }
    
    setIsImporting(true);
    const toastId = toast.loading('Importing CSV cards into deck...');
    
    try {
      const token = Cookies.get('medki_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${baseUrl}/decks/${id}/import-csv`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'CSV Import failed.');
      }
      
      toast.success('Flashcards imported successfully! 🚀', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['deck', id] });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during CSV import.', { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

      {isOwner && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-mono uppercase text-[#1A1A1A]/60">Import Custom CSV Cards</label>
            <button 
              onClick={() => setIsLibraryModalOpen(true)}
              className="px-3 py-1.5 bg-[#A89F91]/20 text-[#1A1A1A] hover:bg-[#A89F91]/40 rounded-lg text-xs font-bold font-grotesk transition-colors duration-200 flex items-center gap-2 cursor-pointer w-fit"
            >
              📁 Import from My Medki Files
            </button>
          </div>
          <div 
            onClick={() => !isImporting && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-[#1A1A1A]/2 transition-all duration-200 ${
              isDragging ? 'border-[#D44D44] bg-[#D44D44]/5' : 'border-[#A89F91]/40 hover:bg-[#1A1A1A]/5 hover:border-[#D44D44]/60'
            } ${isImporting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCsvSelect} 
              className="hidden" 
              accept=".csv"
              disabled={isImporting}
            />
            {isImporting ? (
              <div className="flex items-center gap-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#D44D44] border-t-transparent"></div>
                <span className="font-mono text-xs text-[#D44D44] animate-pulse">Importing CSV payload...</span>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-xl">📊</p>
                <p className="font-grotesk text-xs font-semibold text-[#1A1A1A] group-hover:text-[#D44D44] transition-colors">
                  Drag & drop your custom CSV file here, or click to browse
                </p>
                <p className="font-mono text-[9px] text-[#1A1A1A]/40">CSV format: front,back</p>
              </div>
            )}
          </div>
        </div>
      )}

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

      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-blur-sm">
          <div className="bg-[#F5F2ED] border border-[#A89F91]/30 w-full max-w-lg mx-4 rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-[#A89F91]/15 mb-4">
              <h3 className="font-caslon text-lg font-bold">Select File from Medki Library</h3>
              <button onClick={() => setIsLibraryModalOpen(false)} className="text-sm font-mono cursor-pointer">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {isFilesLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-[#1A1A1A]/5 rounded-xl border border-[#A89F91]/20"></div>
                  ))}
                </div>
              ) : libraryFiles && libraryFiles.length > 0 ? (
                <div className="space-y-3">
                  {libraryFiles.map((file: any) => (
                    <div key={file.id} className="flex justify-between items-center p-4 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 transition-colors border border-[#A89F91]/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📊</span>
                        <p className="font-grotesk text-sm font-semibold text-[#1A1A1A]">{file.file_name}</p>
                      </div>
                      <button 
                        onClick={() => importFromLibraryMutation.mutate(file.id)}
                        disabled={importFromLibraryMutation.isPending}
                        className="px-4 py-2 bg-[#D44D44] text-white rounded-lg text-xs font-bold font-grotesk disabled:opacity-50 hover:bg-[#D44D44]/90 transition-colors cursor-pointer"
                      >
                        Import
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-[#1A1A1A]/5 rounded-xl border border-[#A89F91]/20">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-grotesk text-[#1A1A1A] font-semibold text-lg">Your Medki Library is empty</p>
                  <p className="font-mono text-xs text-[#1A1A1A]/60 mt-2">Generate CSV cards from your study documents first to see them here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}