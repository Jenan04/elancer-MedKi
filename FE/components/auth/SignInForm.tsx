"use client";

import { FormEvent, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Field, PrimaryButton, OAuthButton, Divider } from "./ui";

export function SignInForm({
  onSubmit,
  onForgotPassword,
  onGoogle,
}: {
  onSubmit: (data: { email: string; password: string }) => Promise<void> | void;
  onForgotPassword?: () => void;
  onGoogle?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 1) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
          placeholder="••••••••"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-[family-name:var(--font-jetbrains-mono)] text-[12.5px] text-[#d94e41] transition-colors hover:text-[#c43f33] focus-visible:outline-none focus-visible:underline"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <PrimaryButton type="submit" loading={loading}>
        Sign in
      </PrimaryButton>

      <Divider />

      <OAuthButton onClick={onGoogle} />
    </form>
  );
}