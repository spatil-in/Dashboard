"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Member } from "@/lib/community/types";
import { communityRequest } from "@/lib/community/client";
import NewsletterForm from "./NewsletterForm";

type CommunityContext = {
  member: Member | null;
  setMember: (member: Member | null) => void;
  openAuth: () => void;
  openSubscribe: () => void;
  requireMember: () => boolean;
};

const Context = createContext<CommunityContext | null>(null);

export function useCommunity() {
  const context = useContext(Context);
  if (!context) throw new Error("CommunityProvider is required.");
  return context;
}

export default function CommunityProvider({
  initialMember,
  children,
}: {
  initialMember: Member | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [modal, setModal] = useState<"auth" | "subscribe" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);

  return (
    <Context.Provider
      value={{
        member,
        setMember,
        openAuth: () => router.push("/signin"),
        openSubscribe: () => setModal("subscribe"),
        requireMember: () => {
          if (member) return true;
          router.push("/signin");
          return false;
        },
      }}
    >
      {children}
      <dialog
        aria-label={
          modal === "subscribe"
            ? "Subscribe to the newsletter"
            : "Sign in or create an account"
        }
        ref={dialog}
        className="community-dialog"
        onCancel={() => setModal(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}
      >
        <div className="dialog-inner">
          <button
            className="close-button"
            aria-label="Close dialog"
            onClick={() => setModal(null)}
          >
            <X size={21} />
          </button>
          {modal === "auth" && (
            <AuthForm
              onComplete={(user) => {
                setMember(user);
                setModal(null);
              }}
            />
          )}
          {modal === "subscribe" && (
            <>
              <span className="dialog-eyebrow">THE FRONTLINE NEWSLETTER</span>
              <h2>Stay ahead of what’s next.</h2>
              <p>
                The latest tech news, insights, and developer updates. All in
                one place.
              </p>
              <NewsletterForm />
            </>
          )}
        </div>
      </dialog>
    </Context.Provider>
  );
}

function AuthForm({ onComplete }: { onComplete: (member: Member) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await communityRequest<{ member: Member }>(
        mode,
        Object.fromEntries(data),
      );
      onComplete(result.member);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <span className="dialog-eyebrow">FRONTLINE CODE COMMUNITY</span>
      <h2>{mode === "signin" ? "Welcome back." : "Find your people."}</h2>
      <p>
        {mode === "signin"
          ? "Sign in to save stories and join the conversation."
          : "Create an account to connect, learn, and share."}
      </p>
      <form onSubmit={submit} className="stacked-form">
        {mode === "signup" && (
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Full name"
            />
          </label>
        )}
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={191}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={10}
            maxLength={128}
            placeholder="At least 10 characters"
          />
        </label>
        {error && (
          <p role="alert" className="form-message error">
            {error}
          </p>
        )}
        <button className="button green" disabled={pending}>
          {pending
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
      <p className="auth-switch">
        {mode === "signin"
          ? "New to Frontline Code?"
          : "Already part of the community?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
          }}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </>
  );
}
