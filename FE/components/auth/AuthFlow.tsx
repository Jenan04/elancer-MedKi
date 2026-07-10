"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter} from "next/navigation";
import { AuthShell } from "./AuthShell";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { OtpVerification } from "./OtpVerification";
import { ViewTransition } from "./ViewTransition";
import type { AuthView } from "./types";
import Cookies from 'js-cookie';

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

// export function AuthFlow() {
function AuthFlowInner() {
    const params = useSearchParams();
    const router = useRouter();
  // const [view, setView] = useState<AuthView>("sign-in");
  const [view, setView] = useState<AuthView>(
    params.get("view") === "sign-up" ? "sign-up" : "sign-in"
  );
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState<string | null>(null); // لإدارة الأخطاء وعرضها إن لزم الأمر
  const [isLoading, setIsLoading] = useState(false);

  // const copy = COPY[view];

  function navigate(v: AuthView) {
    setView(v);
    if (v === "sign-in") router.push("/auth");           // clean URL, no query
    else if (v === "sign-up") router.push("/auth?view=sign-up");
    // OTP has no dedicated URL — state only
  }

  const handleAuthSuccess = (token: string, user: any) => {
    Cookies.set("medki_token", token, { expires: 7 }); 
   localStorage.setItem("user_info", JSON.stringify(user));
    router.push("/dashboard"); 
    // window.location.href = "/dashboard";
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

    const resData = await response.json();

    if (response.status === 403 && resData.requires_verification) {
      setPendingEmail(resData.email);
      setView("otp");                  
      return;
    }

    if (!response.ok) {
      throw new Error(resData.message || "Invalid email or password");
    }

    handleAuthSuccess(resData.access_token, resData.user);

  } catch (err: any) {
    setError(err.message);
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

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      setPendingEmail(data.email);
      
      setView("otp");
      

    } catch (err: any) {
      setError(err.message);
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
        otp: code
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || "كود التحقق غير صحيح أو انتهت صلاحيته");
    }

    handleAuthSuccess(resData.access_token, resData.user);

  } catch (err: any) {
    setError(err.message);
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

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || "Failed to resend OTP");
    }

    alert(resData.message || "New OTP sent successfully!");

  } catch (err: any) {
    setError(err.message);
    console.error("Resend OTP error:", err);
  } finally {
    setIsLoading(false);
  }
  }

  return (
    <AuthShell
      // eyebrow={copy.eyebrow}
      // title={copy.title}
      // subtitle={copy.subtitle}
      footer={
        view === "sign-in" ? (
          <>
            New to medki?{" "}
            <button
              onClick={() => setView("sign-up")}
              className="font-medium text-[#d94e41] hover:text-[#c43f33]"
            >
              Create an account
            </button>
          </>
        ) : view === "sign-up" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setView("sign-in")}
              className="font-medium text-[#d94e41] hover:text-[#c43f33]"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Wrong account?{" "}
            <button
              onClick={() => setView("sign-up")}
              className="font-medium text-[#d94e41] hover:text-[#c43f33]"
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
            onGoogle={() => console.log("google oauth")}
          />
        )}
        {view === "sign-up" && (
          <SignUpForm
            onSubmit={handleSignUp}
            onGoogle={() => console.log("google oauth")}
          />
        )}
        {view === "otp" && (
          <OtpVerification
            email={pendingEmail}
            onVerify={handleVerify}
            onResend={handleResend}
            onEditEmail={() => setView("sign-up")}
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