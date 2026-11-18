"use client";
import Link from "next/link";
import { useState } from "react";
import { communityRequest } from "@/lib/community/client";
import type { Member } from "@/lib/community/types";
import { useCommunity } from "./CommunityProvider";

export default function AuthPage({ signup = false }: { signup?: boolean }) {
  const { setMember } = useCommunity();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await communityRequest<{ member: Member }>(
        signup ? "signup" : "signin",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setMember(result.member);
      // Reload the destination with the session cookie returned by the API.
      window.location.replace(signup ? "/topics" : "/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setPending(false);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <div>
          <h1>
            {signup ? (
              <>
                Join the developer
                <br />
                community.
              </>
            ) : (
              "Welcome back."
            )}
          </h1>
          <p>
            {signup
              ? "Create your account to get the weekly newsletter, join the community, and save what you read."
              : "Sign in to pick up where you left off — your feed, your bookmarks, your community."}
          </p>
          {signup ? (
            <ul>
              {[
                "Weekly newsletter, zero spam",
                "AI-curated reads picked for you",
                "Hackathons, events & mentorship",
                "Guided learning paths & badges",
              ].map((item) => (
                <li key={item}>
                  ✓ <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="auth-members">
              <span>●●●●</span> Developers building together
            </div>
          )}
        </div>
        <span className="auth-wordmark">Front/ine</span>
      </aside>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <h2>
            {signup ? "Create your account" : "Sign in to Frontline Code"}
          </h2>
          <p>
            {signup ? "Already have an account?" : "New here?"}{" "}
            <Link href={signup ? "/signin" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <div className="social-buttons">
            <button
              onClick={() =>
                setMessage(
                  "GitHub sign-in requires OAuth credentials. You can continue with email below.",
                )
              }
            >
              ‹› &nbsp; Continue with GitHub
            </button>
            <button
              onClick={() =>
                setMessage(
                  "Google sign-in requires OAuth credentials. You can continue with email below.",
                )
              }
            >
              <span>●</span> Continue with Google
            </button>
          </div>
          <div className="auth-divider">or continue with email</div>
          <form onSubmit={submit} className="stacked-form">
            {signup && (
              <label>
                Full name
                <input
                  name="name"
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                maxLength={191}
              />
            </label>
            <label>
              <span>Password {!signup && <button type="button" className="password-help" onClick={() => setMessage("Password recovery requires an email delivery provider. Contact the site administrator for account support.")}>Forgot password?</button>}</span>
              <input
                type="password"
                name="password"
                placeholder={
                  signup ? "Create a password" : "Enter your password"
                }
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={10}
                maxLength={128}
              />
            </label>
            {signup && (
              <>
                <small>Must be at least 10 characters.</small>
                <label className="terms-check">
                  <input type="checkbox" required />{" "}
                  <span>
                    I agree to the{" "}
                    <Link href="/info/privacy">
                      Terms of Service and Privacy Policy.
                    </Link>
                  </span>
                </label>
              </>
            )}
            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}
            <button className="button green" disabled={pending}>
              {pending ? "Please wait…" : signup ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="auth-bottom">
            {signup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <Link href={signup ? "/signin" : "/signup"}>
              {signup ? "Sign in" : "Sign up"}
            </Link>
          </p>
          {!signup && (
            <small className="auth-legal">
              By continuing, you agree to our{" "}
              <Link href="/info/privacy">
                Terms of Service and Privacy Policy.
              </Link>
            </small>
          )}
        </div>
      </section>
    </div>
  );
}
