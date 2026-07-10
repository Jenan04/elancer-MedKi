"use client";

import { InputHTMLAttributes, ReactNode, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GoogleIcon } from "./GoogleIcon";

/* ---------------------------------------------------------------------- */
/*  Field — labeled input, mono uppercase label to match card meta text   */
/* ---------------------------------------------------------------------- */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, icon, error, type, className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (show ? "text" : "password") : type;

    return (
      <label className="block">
        <span className="mb-1.5 block font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-[#0f0f11]/60">
          {label}
        </span>
        <span className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 text-[#0f0f11]/35">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={`w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-[#0f0f11] placeholder:text-[#0f0f11]/30 transition-all duration-150 ${
              icon ? "pl-10" : ""
            } ${isPassword ? "pr-11" : ""} ${
              error
                ? "border-[#d94e41]/60 focus:ring-2 focus:ring-[#d94e41]/25"
                : "border-[#0f0f11]/10 focus:border-[#d94e41]/50 focus:ring-2 focus:ring-[#d94e41]/15"
            } outline-none focus:bg-white`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 text-[#0f0f11]/35 transition-colors hover:text-[#0f0f11]/70"
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </span>
        {error && (
          <span className="mt-1.5 block text-[12.5px] text-[#d94e41]">
            {error}
          </span>
        )}
      </label>
    );
  }
);
Field.displayName = "Field";

/* ---------------------------------------------------------------------- */
/*  PrimaryButton — terracotta CTA, matches "Convert Your First File"     */
/* ---------------------------------------------------------------------- */

export function PrimaryButton({
  children,
  loading,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={`group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#d94e41] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(15,15,17,0.08)] transition-all duration-150 hover:bg-[#c43f33] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94e41]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf6] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        children
      )}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/*  OAuthButton — "Continue with Google", quiet outline treatment         */
/* ---------------------------------------------------------------------- */

export function OAuthButton({
  onClick,
  label = "Continue with Google",
}: {
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#0f0f11]/10 bg-white px-5 py-3.5 text-[15px] font-medium text-[#0f0f11] transition-all duration-150 hover:border-[#0f0f11]/20 hover:bg-[#0f0f11]/[0.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f11]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf6]"
    >
      <GoogleIcon className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/*  Divider — "or" rule between form and OAuth                            */
/* ---------------------------------------------------------------------- */

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-[#0f0f11]/10" />
      <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.12em] text-[#0f0f11]/35">
        {label}
      </span>
      <span className="h-px flex-1 bg-[#0f0f11]/10" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Badge — small pill, e.g. "SPACED REPETITION V2"                       */
/* ---------------------------------------------------------------------- */

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#d94e41]/25 bg-[#d94e41]/[0.06] px-3 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-[#d94e41]">
      {children}
    </span>
  );
}