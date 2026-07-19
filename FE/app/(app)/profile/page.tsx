'use client';

import React, { useState } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useQuery, useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

type TabType = 'account' | 'stats' | 'settings';

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useAuthUser();
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [newCardsLimit, setNewCardsLimit] = useState(20);
  const [reviewCardsLimit, setReviewCardsLimit] = useState(50);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Something went wrong.');
    }
  });

  if (isUserLoading) return <p className="p-8 text-center font-mono text-xs">Loading profile...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 space-y-8">
      
      <div className="flex items-center gap-5 p-6 bg-[#F5F2ED] border border-[#A89F91]/30 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-caslon text-xl font-bold border border-[#A89F91]/40">
          {user?.name?.substring(0, 2).toUpperCase() || 'MK'}
        </div>
        <div>
          <h1 className="font-caslon text-2xl font-bold text-[#1A1A1A]">{user?.name || 'Medki User'}</h1>
          <p className="font-grotesk text-xs text-[#1A1A1A]/60 font-mono mt-0.5">{user?.email}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#A89F91]/20 pb-px">
        {(['account', 'stats', 'settings'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-grotesk text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === tab
                ? 'border-[#D44D44] text-[#D44D44]'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            {tab === 'account' && '👤 Account'}
            {tab === 'stats' && '📊 Analytics'}
            {tab === 'settings' && '⚙️ Study Settings'}
          </button>
        ))}
      </div>

      <div className="bg-[#F5F2ED] border border-[#A89F91]/30 rounded-2xl p-6 min-h-[350px]">
        
        {activeTab === 'account' && (
          <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate({ name, email }); }} className="space-y-6 max-w-xl">
            <h3 className="font-caslon text-lg font-bold text-[#1A1A1A] border-b border-[#A89F91]/15 pb-2">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-[#1A1A1A]/60">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-[#1A1A1A]/60">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44]"
                />
              </div>
            </div>

            <h3 className="font-caslon text-lg font-bold text-[#1A1A1A] border-b border-[#A89F91]/15 pb-2 pt-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-[#1A1A1A]/60">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-[#1A1A1A]/60">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#A89F91]/15 flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-6 py-2 bg-[#D44D44] text-white rounded-xl text-xs font-bold font-grotesk hover:bg-[#D44D44]/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h3 className="font-caslon text-lg font-bold text-[#1A1A1A] border-b border-[#A89F91]/15 pb-2">Your Performance</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#1A1A1A]/5 border border-[#A89F91]/20 rounded-xl text-center">
                <p className="text-xl">🔥</p>
                <p className="font-caslon text-2xl font-bold text-[#1A1A1A] mt-1">0 Days</p>
                <p className="font-mono text-[10px] uppercase text-[#1A1A1A]/50 mt-0.5">Current Streak</p>
              </div>
              <div className="p-4 bg-[#1A1A1A]/5 border border-[#A89F91]/20 rounded-xl text-center">
                <p className="text-xl">✅</p>
                <p className="font-caslon text-2xl font-bold text-[#1A1A1A] mt-1">342</p>
                <p className="font-mono text-[10px] uppercase text-[#1A1A1A]/50 mt-0.5">Total Reviewed Cards</p>
              </div>
              <div className="p-4 bg-[#1A1A1A]/5 border border-[#A89F91]/20 rounded-xl text-center">
                <p className="text-xl">🎯</p>
                <p className="font-caslon text-2xl font-bold text-[#1A1A1A] mt-1">87%</p>
                <p className="font-mono text-[10px] uppercase text-[#1A1A1A]/50 mt-0.5">Retention Rate</p>
              </div>
            </div>

            <div className="p-4 bg-[#1A1A1A]/3 border border-[#A89F91]/20 rounded-xl space-y-2">
              <label className="block text-[10px] font-mono uppercase text-[#1A1A1A]/60">Study Consistency Calendar</label>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-4 w-4 rounded-xs border border-[#A89F91]/10 ${
                      i % 7 === 0 ? 'bg-[#D44D44]' : i % 5 === 0 ? 'bg-[#D44D44]/40' : 'bg-[#1A1A1A]/5'
                    }`}
                    title={`Day ${i + 1}`}
                  />
                ))}
              </div>
              <p className="font-mono text-[9px] text-[#1A1A1A]/40 pt-1">Visualizing card activity over the last 4 weeks.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="font-caslon text-lg font-bold text-[#1A1A1A] border-b border-[#A89F91]/15 pb-2">Spaced Repetition (SM-2 Algorithm)</h3>
            <p className="font-grotesk text-xs text-[#1A1A1A]/60 leading-relaxed">
              Adjust your daily intake and review thresholds to optimize long-term medical retention intervals.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-[#1A1A1A]/60">Maximum New Cards / Day</label>
                  <span className="font-mono text-xs font-bold text-[#D44D44]">{newCardsLimit} cards</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={newCardsLimit}
                  onChange={(e) => setNewCardsLimit(Number(e.target.value))}
                  className="w-full accent-[#D44D44] bg-[#1A1A1A]/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-[#1A1A1A]/60">Maximum Review Cards / Day</label>
                  <span className="font-mono text-xs font-bold text-[#D44D44]">{reviewCardsLimit} cards</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={reviewCardsLimit}
                  onChange={(e) => setReviewCardsLimit(Number(e.target.value))}
                  className="w-full accent-[#D44D44] bg-[#1A1A1A]/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#A89F91]/15 flex justify-end">
              <button
                onClick={() => toast.success('Algorithm thresholds updated!')}
                className="px-5 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold font-grotesk hover:bg-[#1A1A1A]/90 transition-colors cursor-pointer"
              >
                Apply Algorithm Rules
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}