"use client";

import { Plus } from "lucide-react";
import { ReactNode } from "react";
import FlashcardWidget from "@/components/FlashcardWidget"; // adjust path to yours

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#fcfaf6]">
      {/* Left / brand panel — hidden below lg, matches hero's warm tone */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-[#0f0f11] px-14 py-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Plus size={16} className="text-white" strokeWidth={2.5} />
            </span>
            <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-white">
              med<span className="text-[#e2685c]">ki</span>
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <FlashcardWidget
             deck="medki::auth::session"
             question="What muscle initiates arm abduction in the first 15 degrees?"
             answer="The supraspinatus muscle initiates abduction of the arm for the first 15°. It originates from the supraspinous fossa of the scapula and inserts at the greater tubercle of the humerus."
             meta="Card #112 · Anatomy"
             delayClass="delay-0"
           />
        </div>

        <p className="relative max-w-sm font-[family-name:var(--font-playfair)] text-2xl leading-snug text-white/90">
          Watch the body build itself,{" "}
          <span className="text-[#e2685c]">card by card.</span>
        </p>
      </div>

      {/* Right / form panel */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-14 sm:px-10">
        {/* <div className="mb-8 flex w-full max-w-md items-center justify-between lg:hidden">
          <Wordmark />
        </div> */}

        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="mb-4 inline-flex items-center rounded-full border border-[#d94e41]/25 bg-[#d94e41]/[0.06] px-3 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-[#d94e41]">
              {eyebrow}
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-[32px] font-semibold leading-tight text-[#0f0f11] sm:text-[36px]">
              {title}
            </h1>
            <p className="mt-2 text-[15px] text-[#0f0f11]/55">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-[#0f0f11]/[0.08] bg-white p-7 shadow-[0_1px_2px_rgba(15,15,17,0.04)] sm:p-8">
            {children}
          </div>

          <div className="mt-6 text-center text-[14px] text-[#0f0f11]/55">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}