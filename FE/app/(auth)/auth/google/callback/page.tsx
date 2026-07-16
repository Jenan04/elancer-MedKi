"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleCallbackInner() {
  const params = useSearchParams();

  //   useEffect(() => {
//     const code = params.get("code");
//     const error = params.get("error");

//     if (error || !code) {
//       router.push("/auth?error=oauth_failed");
//       return;
//     }

//     fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/callback`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//       },
//       body: JSON.stringify({ code }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (!data.token) throw new Error("No token");

//     // Same pattern you already use in handleAuthSuccess
//     Cookies.set("medki_token", data.token, {
//       expires: 7,
//       secure: true,
//       sameSite: "strict",
//     });

//     // router.push("/dashboard");
//      localStorage.setItem("user_info", JSON.stringify(data.user));
//         router.push("/dashboard");
//       })
//       .catch(() => {
//         router.push("/auth?error=oauth_failed");
//       });
//   }, [params, router]);

//   return (
//     <div className="flex h-screen items-center justify-center">
//       <p className="text-sm text-[#0f0f11]/45">Signing you in...</p>
//     </div>
//   );
// }

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");

    if (error || !code) {
      window.opener?.postMessage(
        { type: "GOOGLE_AUTH_ERROR" },
        window.location.origin
      );
      window.close();
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.token) throw new Error("No token");

        // بعت التوكن للـ parent window
        window.opener?.postMessage(
          { type: "GOOGLE_AUTH_SUCCESS", token: data.token, user: data.user },
          window.location.origin
        );

        window.close(); // أغلق الـ popup
      })
      .catch(() => {
        window.opener?.postMessage(
          { type: "GOOGLE_AUTH_ERROR" },
          window.location.origin
        );
        window.close();
      });
  }, [params]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d94e41] border-t-transparent" />
      <p className="text-sm text-[#0f0f11]/45">Completing sign in...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackInner />
    </Suspense>
  );
}