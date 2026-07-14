"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { OtpVerification } from "./OtpVerification";
import { ViewTransition } from "./ViewTransition";
import type { AuthView } from "./types";
import Cookies from "js-cookie";

// Define strict interfaces for user and API payloads
interface UserInfo {
  id: string | number;
  email: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthSuccessResponse {
  access_token: string;
  user: UserInfo;
}

interface RequireVerificationResponse {
  requires_verification: boolean;
  email: string;
}

interface ErrorResponse {
  message?: string;
}

const COPY: Record<AuthView, { eyebrow: string; title: string; subtitle: string }> = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to medki",
    subtitle: "Pick up your recall queue right where you left it.",
  },
  "sign-up": {
    eyebrow: "Get started",
    title: "Create your account",
    subtitle: "Turn your first lecture into a deck in under a minute.",
  },
  otp: {
    eyebrow: "Verify it's you",
    title: "Check your inbox",
    subtitle: "Enter the code to finish setting up your account.",
  },
};

function AuthFlowInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState<AuthView>(() => {
    return params.get("view") === "sign-up" ? "sign-up" : "sign-in";
  });
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const copy = COPY[view];

  // Refactored to handle internal state changes and URL state cleanly
  function navigate(v: AuthView) {
    setView(v);
    setError(null); // Clear errors when shifting views
    if (v === "sign-in") router.push("/auth");
    else if (v === "sign-up") router.push("/auth?view=sign-up");
  }

  const handleAuthSuccess = (token: string, user: UserInfo) => {
    Cookies.set("medki_token", token, { 
      expires: 7, 
      secure: true, 
      sameSite: "strict" 
    });
    // localStorage.setItem("user_info", JSON.stringify(user));
    // localStorage.setItem('auth_token', token);

    router.push("/decks");
  };

  async function handleSignIn(data: { email: string; password: string }) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json() as AuthSuccessResponse & RequireVerificationResponse & ErrorResponse;

      if (response.status === 403 && resData.requires_verification) {
        setPendingEmail(resData.email);
        setView("otp");
        return;
      }

      if (!response.ok) {
        throw new Error(resData.message || "Invalid email or password");
      }

      handleAuthSuccess(resData.access_token, resData.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(data: { name: string; email: string; password: string }) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json() as ErrorResponse;

      if (!response.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      setPendingEmail(data.email);
      setView("otp");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(code: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
          otp: code,
        }),
      });

      const resData = await response.json() as AuthSuccessResponse & ErrorResponse;

      if (!response.ok) {
        throw new Error(resData.message || "OTP expired or invalid");
      }

      handleAuthSuccess(resData.access_token, resData.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("OTP Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const resData = await response.json() as ErrorResponse & { message?: string };

      if (!response.ok) {
        throw new Error(resData.message || "Failed to resend OTP");
      }

      alert(resData.message || "New OTP sent successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Resend OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  }

//   async function handleGoogleAuth() {
//   setIsLoading(true);
//   setError(null);

//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/redirect`, {
//       headers: { "Accept": "application/json" },
//     });

//     const data = await response.json() as { url: string };

//     if (!response.ok) throw new Error("Failed to get Google redirect URL");

//     // Redirect the browser to Google's OAuth page
//     window.location.href = data.url;

//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
//     setError(errorMessage);
//   } 
//   // finally {
//   //   setIsLoading(false);
//   // }
// }

async function handleGoogleAuth() {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/redirect`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) throw new Error("Failed to get redirect URL");

    const data = await response.json() as { url: string };

    // افتح Google في popup
    const popup = window.open(
      data.url,
      "google-oauth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        const { token } = event.data;

        Cookies.set("medki_token", token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });

        // localStorage.setItem("user_info", JSON.stringify(user));
        popup?.close();
        router.push("/decks");
      }

      if (event.data.type === "GOOGLE_AUTH_ERROR") {
        setError("Google sign in failed, please try again.");
        setIsLoading(false);
        popup?.close();
      }

      window.removeEventListener("message", handleMessage);
    };

    window.addEventListener("message", handleMessage);

    // لو اليوزر أغلق الـ popup بنفسه
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);

  } catch (err) {
    setError(err instanceof Error ? err.message : "An unexpected error occurred");
    setIsLoading(false);
  }
}

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        view === "sign-in" ? (
          <>
            New to medki?{" "}
            <button
              onClick={() => navigate("sign-up")}
              disabled={isLoading}
              className="font-medium text-[#d94e41] hover:text-[#c43f33] disabled:opacity-50"
            >
              Create an account
            </button>
          </>
        ) : view === "sign-up" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => navigate("sign-in")}
              disabled={isLoading}
              className="font-medium text-[#d94e41] hover:text-[#c43f33] disabled:opacity-50"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Wrong account?{" "}
            <button
              onClick={() => navigate("sign-up")}
              disabled={isLoading}
              className="font-medium text-[#d94e41] hover:text-[#c43f33] disabled:opacity-50"
            >
              Go back
            </button>
          </>
        )
      }
    >
      {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
      <ViewTransition viewKey={view}>
        {view === "sign-in" && (
          <SignInForm
            onSubmit={handleSignIn}
            onForgotPassword={() => console.log("forgot password")}
            onGoogle={handleGoogleAuth}
          />
        )}
        {view === "sign-up" && (
          <SignUpForm
            onSubmit={handleSignUp}
            onGoogle={handleGoogleAuth}
          />
        )}
        {view === "otp" && (
          <OtpVerification
            email={pendingEmail}
            onVerify={handleVerify}
            onResend={handleResend}
            onEditEmail={() => navigate("sign-up")}
          />
        )}
      </ViewTransition>
    </AuthShell>
  );
}

export function AuthFlow() {
  return (
    <Suspense>
      <AuthFlowInner />
    </Suspense>
  );
}