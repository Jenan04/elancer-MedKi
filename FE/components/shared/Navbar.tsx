"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Cookies from 'js-cookie';
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useLogout } from "@/hooks/useLogout";

interface NavbarProps {
  onLogout?: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuth, isLoading } = useAuthUser(); // ← replaces all props

  const logout = useLogout();

  // const hasToken = !!Cookies.get('medki_token');
    // const [hasToken, setHasToken] = useState(false);
  const [hasToken] = useState(() => !!Cookies.get('medki_token'));

  
  // ✅ إذا في token أو isAuth — اعتبره auth
  // const showAuthNav = isAuth || hasToken;
  

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showAuthNav = isAuth || hasToken;

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ").filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "ME";
  };

  
  const guestLinks = [
    { name: "Home", href: "/#" },
    { name: "Flashcards", href: "/#flashcards" },
    { name: "AI Converters", href: "/#ai-converters" },
    { name: "Contact", href: "/#contact" },
  ];

  const authLinks = [
    { name: "Decks", href: "/decks" },
    { name: "Convert File", href: "/convert" },
    { name: "Files", href: "/files" },
    { name: "Profile", href: "/profile" },
  ];

  const currentLinks = showAuthNav ? authLinks : guestLinks;
if (isLoading) return <NavbarSkeleton />;
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-[#F5F2ED]/80 backdrop-blur-md sticky top-4 w-11/12 rounded-full shadow-md border border-[#A89F91]/25 py-3"
            : "bg-transparent w-full py-2 border-b border-transparent"
        }`}
      >
        <Link href={showAuthNav  ? "/decks" : "/"} className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-[#1A1A1A] text-[#F5F2ED] transition-transform duration-300 group-hover:scale-105">
            <svg className="w-4.5 h-4.5 text-[#D44D44] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-caslon text-2xl font-bold tracking-tight text-[#1A1A1A]">
            med<span className="text-[#D44D44]">ki</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {currentLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-semibold font-grotesk py-1 transition-colors duration-200 ${
                  isActive ? "text-[#D44D44]" : "text-[#1A1A1A]/80 hover:text-[#D44D44]"
                }`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#D44D44] transition-all duration-300 ${isActive ? "w-full" : "w-0"}`} />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4.5">
          {showAuthNav  ? (
            <div className="flex items-center gap-4 md:gap-5">

              <div
                className="flex items-center gap-1.5 bg-[#1A1A1A]/5 px-2.5 py-1 rounded-full text-xs font-mono text-[#1A1A1A]/80"
                title="Daily Studying Streak"
              >
                <span>🔥</span>
                <span className="font-bold">{user?.stats?.streakCount ?? 0}</span>
              </div>

              <button className="relative text-[#1A1A1A]/70 hover:text-[#D44D44] transition-colors p-1" aria-label="Notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D44D44] rounded-full" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  className="group flex items-center focus:outline-hidden"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User Avatar"}
                      className={`w-8 h-8 rounded-full object-cover transition-all duration-300 ${
                        dropdownOpen ? "ring-2 ring-[#D44D44]/20 scale-105" : ""
                      }`}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold tracking-tighter transition-all duration-300 shadow-xs ${
                      dropdownOpen
                        ? "bg-[#D44D44] text-[#F5F2ED] ring-2 ring-[#D44D44]/20 scale-105"
                        : "bg-[#1A1A1A] text-[#F5F2ED] group-hover:bg-[#D44D44]"
                    }`}>
                      {getInitials(user?.name, user?.email)}
                    </div>
                  )}
                </button>

                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className={`absolute right-0 mt-3.5 w-60 bg-[#F5F2ED] border border-[#A89F91]/30 rounded-2xl shadow-xl transition-all duration-300 origin-top-right z-50 overflow-hidden ${
                    dropdownOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="px-5 py-4 border-b border-[#A89F91]/15 bg-[#1A1A1A]/[0.02]">
                    <p className="text-xs font-mono text-[#1A1A1A]/40 uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="font-caslon text-base font-bold text-[#1A1A1A] truncate">
                      {user?.name ?? "..."}
                    </p>
                    <p className="font-grotesk text-xs text-[#1A1A1A]/60 truncate">
                      {user?.email ?? ""}
                    </p>
                  </div>

                  <div className="px-5 py-3 border-b border-[#A89F91]/15 bg-[#D44D44]/[0.02] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#1A1A1A]/60">Cards Due Today:</span>
                    <span className="font-bold text-[#D44D44] bg-[#D44D44]/10 px-2 py-0.5 rounded-full">
                      {user?.stats?.dueCardsCount ?? 0} Cards
                    </span>
                  </div>

                  <div className="p-2 space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-grotesk text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 text-[#1A1A1A]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile Space
                    </Link>
                    <Link
                      href="/profile?tab=settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-grotesk text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 text-[#1A1A1A]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      Study Settings
                    </Link>
                  </div>

                  <div className="p-2 border-t border-[#A89F91]/15 bg-[#1A1A1A]/[0.01]">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-grotesk text-[#D44D44] hover:bg-[#D44D44]/5 transition-all duration-200 text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-[#1A1A1A]/20 hover:border-[#D44D44] rounded-full text-xs font-mono tracking-wider uppercase text-[#1A1A1A] hover:text-[#D44D44] transition-all duration-300 hover:bg-[#D44D44]/5"
              >
                Launch app
              </Link>
              <Link
                href="/auth?view=sign-up"
                className="inline-flex items-center justify-center px-4.5 py-2.5 bg-[#D44D44] hover:bg-[#D44D44]/95 text-white font-grotesk text-sm font-semibold rounded-full shadow-sm transition-all duration-300 hover:shadow-md active:scale-98"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavbarSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-6 w-full">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-[#D44D44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-caslon text-2xl font-bold tracking-tight text-[#1A1A1A]">
            med<span className="text-[#D44D44]">ki</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[44, 76, 38, 52].map((w, i) => (
            <div
              key={i}
              className="h-3.5 bg-[#A89F91]/30 rounded animate-pulse"
              style={{ width: w, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div
            className="h-6 w-12 bg-[#A89F91]/30 rounded-full animate-pulse"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="h-5 w-5 bg-[#A89F91]/30 rounded animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-8 h-8 rounded-full bg-[#A89F91]/30 animate-pulse"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

      </nav>
    </header>
  );
}