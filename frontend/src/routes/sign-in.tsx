import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Wordmark } from "@/components/app/app-shell";
import { loginWithGoogle } from "@/lib/api";
import { GOOGLE_CLIENT_ID, useSession } from "@/lib/session";

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? (search["next"] as string) : "/chat",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — AskDocs" },
      { name: "description", content: "Sign in with Google to chat with your documents." },
      { property: "og:title", content: "Sign in — AskDocs" },
      {
        property: "og:description",
        content: "Sign in with Google to chat with your documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: next as "/chat", replace: true });
  }, [user, next, navigate]);

  useEffect(() => {
    const render = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response.credential) {
            setError("Google did not return a credential.");
            return;
          }
          setBusy(true);
          loginWithGoogle(response.credential)
            .then(() => navigate({ to: next as "/chat", replace: true }))
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Sign-in failed");
            })
            .finally(() => setBusy(false));
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
      });
    };

    if (window.google) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = render;
    script.onerror = () => setError("Could not load Google sign-in.");
    document.head.appendChild(script);
  }, [navigate, next]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-5">
      <Wordmark />
      <h1 className="mt-6 font-heading text-[34px] italic leading-tight text-ink/90">
        Welcome back.
      </h1>
      <p className="mt-2 max-w-sm text-center text-[13px] text-ink/50">
        Sign in to open your document chats.
      </p>
      <div className="mt-7 min-h-[44px]" ref={buttonRef} />
      {busy ? <p className="mt-3 text-[12px] text-ink/40">Signing you in…</p> : null}
      {error ? <p className="mt-3 text-[12px] text-status-bad">{error}</p> : null}
    </main>
  );
}
