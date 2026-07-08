"use client";

import { FormEvent, useState } from "react";
import { User, Mail, Lock, Check } from "lucide-react";
import { Field, PrimaryButton, OAuthButton, Divider } from "./ui";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
}

export function SignUpForm({
  onSubmit,
  onGoogle,
}: {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  onGoogle?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);
  const strengthLabel = ["Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor =
    strength <= 1
      ? "bg-[#d94e41]"
      : strength === 2
      ? "bg-amber-500"
      : "bg-emerald-500";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Errors = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8)
      nextErrors.password = "Use at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await onSubmit({ name, email, password });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field
        label="Full name"
        type="text"
        placeholder="Jordan Ahmadi"
        icon={<User size={16} />}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="name"
      />

      <Field
        label="Email"
        type="email"
        placeholder="you@medschool.edu"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      <div>
        <Field
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        {password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1 flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-full flex-1 rounded-full transition-colors duration-200 ${
                    i < strength ? strengthColor : "bg-[#0f0f11]/8"
                  }`}
                />
              ))}
            </div>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] uppercase tracking-wide text-[#0f0f11]/45">
              {strengthLabel}
            </span>
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#0f0f11]/45">
        <Check size={14} className="mt-[3px] shrink-0 text-[#d94e41]" />
        By creating an account, you agree to medki&apos;s Terms of Service
        and Privacy Policy.
      </p>

      <PrimaryButton type="submit" loading={loading}>
        Create account
      </PrimaryButton>

      <Divider />

      <OAuthButton onClick={onGoogle} />
    </form>
  );
}