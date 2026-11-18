"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { communityRequest } from "@/lib/community/client";
import { categories, type Member } from "@/lib/community/types";
import { useCommunity } from "./CommunityProvider";

export function SignInPrompt({
  title = "Sign in to join the conversation.",
}: {
  title?: string;
}) {
  const { openAuth } = useCommunity();
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>
        Save your favorite stories, share your ideas, and connect with the
        community.
      </p>
      <button className="button green" onClick={openAuth}>
        Sign in
      </button>
    </div>
  );
}

export function WriteForm() {
  const { member } = useCommunity();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage("");
    try {
      const result = await communityRequest(
        "submit",
        Object.fromEntries(new FormData(form)),
      );
      setMessage(result.message);
      setError(false);
      form.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setError(true);
    } finally {
      setPending(false);
    }
  }
  if (!member) return <SignInPrompt title="Your perspective belongs here." />;
  return (
    <form className="stacked-form" onSubmit={submit}>
      <label>
        Article title
        <input
          name="title"
          placeholder="What’s your story?"
          required
          minLength={5}
          maxLength={255}
        />
      </label>
      <label>
        Category
        <select name="category">
          {categories
            .filter((category) => !category.includes("Marketplace"))
            .map((category) => (
              <option key={category}>{category}</option>
            ))}
        </select>
      </label>
      <label>
        Your article
        <textarea
          name="body"
          placeholder="Share your expertise, a fresh perspective, or something you’ve built…"
          minLength={50}
          maxLength={50000}
          required
          rows={12}
        />
      </label>
      <button className="button green" disabled={pending}>
        {pending ? "Submitting…" : "Submit for review"}
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

export function ProfileForm() {
  const { member, setMember } = useCommunity();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await communityRequest<{
        member: Member;
        message: string;
      }>("profile", Object.fromEntries(new FormData(event.currentTarget)));
      setMember(result.member);
      setMessage(result.message);
      setError(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setError(true);
    } finally {
      setPending(false);
    }
  }
  if (!member) return <SignInPrompt title="Make yourself at home." />;
  return (
    <form className="stacked-form" onSubmit={save}>
      <label>
        Your name
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={member.name}
          autoComplete="name"
        />
      </label>
      <label>
        What do you work on?
        <input
          name="specialty"
          maxLength={150}
          defaultValue={member.specialty ?? ""}
          placeholder="e.g. Distributed systems"
        />
      </label>
      <label>
        About you
        <textarea
          name="bio"
          maxLength={500}
          defaultValue={member.bio ?? ""}
          placeholder="A few words about your interests and experience"
        />
      </label>
      <button className="button green" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
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
