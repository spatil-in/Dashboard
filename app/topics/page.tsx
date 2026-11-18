"use client";
import { useState } from "react";
import { communityRequest } from "@/lib/community/client";
import { useCommunity } from "@/components/community/CommunityProvider";
export default function TopicsPage() {
  const { member, openAuth } = useCommunity();
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!member) {
      openAuth();
      return;
    }
    setPending(true);
    setError("");
    try {
      await communityRequest("topics", { topics: selected });
      // Start a fresh request after saving so the home page reads the new preferences.
      window.location.replace("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
      setPending(false);
    }
  }
  return (
    <section className="topic-page">
      <span className="topic-check">✓</span>
      <h1>
        Welcome to Frontline Code,
        <br />
        {member?.name.split(" ")[0] || "developer"}!
      </h1>
      <p>
        Your account is ready. Pick a few topics you care about and we’ll
        personalize your feed for you.
      </p>
      <div className="topic-options">
        {[
          "AI & Tooling",
          "DevOps",
          "Frontend",
          "Backend",
          "Career",
          "Security",
          "Open Source",
          "Design",
        ].map((topic) => (
          <button
            key={topic}
            aria-pressed={selected.includes(topic)}
            onClick={() =>
              setSelected((current) =>
                current.includes(topic)
                  ? current.filter((item) => item !== topic)
                  : [...current, topic],
              )
            }
          >
            {selected.includes(topic) ? "✓ " : ""}
            {topic}
          </button>
        ))}
      </div>
      <button
        className="button green"
        disabled={pending || !selected.length}
        onClick={save}
      >
        {pending ? "Saving…" : "Continue to my feed"}
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
