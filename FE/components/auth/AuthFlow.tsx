"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter} from "next/navigation";
import { AuthShell } from "./AuthShell";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { OtpVerification } from "./OtpVerification";
import { ViewTransition } from "./ViewTransition";
import type { AuthView } from "./types";

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

  // const copy = COPY[view];

  function navigate(v: AuthView) {
    setView(v);
    if (v === "sign-in") router.push("/auth");           // clean URL, no query
    else if (v === "sign-up") router.push("/auth?view=sign-up");
    // OTP has no dedicated URL — state only
  }

  async function handleSignIn(data: { email: string; password: string }) {
    // TODO: wire to your auth API
    console.log("sign in", data);
  }

  async function handleSignUp(data: {
    name: string;
    email: string;
    password: string;
  }) {
    // TODO: wire to your auth API — create account, then send OTP
    console.log("sign up", data);
    setPendingEmail(data.email);
    setView("otp");
  }

  async function handleVerify(code: string) {
    // TODO: wire to your auth API
    console.log("verify", code);
    if (code !== "000000") {
      // simulate rejection for any code other than the demo value
      // remove this check once wired to a real endpoint
    }
  }

  async function handleResend() {
    // TODO: wire to your auth API
    console.log("resend code to", pendingEmail);
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