"use client";

import { useState } from "react";
import { communityRequest } from "@/lib/community/client";

export default function NewsletterForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setPending(true);
    setMessage("");
    try {
      const result = await communityRequest("subscribe", { email });
      setMessage(result.message);
      setError(false);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="newsletter-form" onSubmit={subscribe}>
      <label>
        <span className="sr-only">Email address</span>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          required
          maxLength={191}
        />
      </label>
      <button disabled={pending}>
        {pending ? "Subscribing…" : "Subscribe"}
      </button>
      {message && (
        <p
          className={`form-message ${error ? "error" : "success"}`}
          role={error ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
