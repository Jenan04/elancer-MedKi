"use client";

import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { PrimaryButton } from "./ui";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OtpVerification({
  email,
  onVerify,
  onResend,
  onEditEmail,
}: {
  email: string;
  onVerify: (code: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  onEditEmail?: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const code = digits.join("");

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/[^0-9]/g, "").slice(-1);
    setDigitAt(index, value);
    setError(null);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigitAt(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  async function handleVerify() {
    if (code.length < OTP_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onVerify(code);
    } catch {
      setError("That code didn't match. Try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setError(null);
    inputsRef.current[0]?.focus();
    await onResend();
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[14px] leading-relaxed text-[#0f0f11]/60">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-[#0f0f11]">{email}</span>.
        {onEditEmail && (
          <button
            type="button"
            onClick={onEditEmail}
            className="ml-1.5 font-[family-name:var(--font-jetbrains-mono)] text-[12.5px] text-[#d94e41] hover:text-[#c43f33]"
          >
            Edit
          </button>
        )}
      </p>

      <div>
        <div className="flex justify-between gap-2 sm:gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              className={`h-14 w-full max-w-[52px] rounded-xl border bg-white text-center font-[family-name:var(--font-jetbrains-mono)] text-xl font-semibold text-[#0f0f11] outline-none transition-all duration-150 ${
                error
                  ? "border-[#d94e41]/60"
                  : digit
                  ? "border-[#d94e41]/40"
                  : "border-[#0f0f11]/10"
              } focus:border-[#d94e41]/60 focus:ring-2 focus:ring-[#d94e41]/15`}
            />
          ))}
        </div>
        {error && (
          <p className="mt-2 text-[12.5px] text-[#d94e41]">{error}</p>
        )}
      </div>

      <PrimaryButton onClick={handleVerify} loading={loading}>
        Verify &amp; continue
      </PrimaryButton>

      <div className="text-center font-[family-name:var(--font-jetbrains-mono)] text-[12.5px] text-[#0f0f11]/45">
        {secondsLeft > 0 ? (
          <span>
            Resend code in{" "}
            <span className="text-[#0f0f11]/70">
              00:{secondsLeft.toString().padStart(2, "0")}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-[#d94e41] hover:text-[#c43f33]"
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}