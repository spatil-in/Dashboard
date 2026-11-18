"use client";

import { Bookmark, Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FeedPost } from "@/lib/community/types";
import { formatDate, initials } from "@/lib/community/types";
import { communityRequest } from "@/lib/community/client";
import { useCommunity } from "./CommunityProvider";

type ArticleComment = {
  id: number;
  body: string;
  createdAt: string;
  user: { name: string };
};

export default function ArticleInteractions({
  post,
  initialComments,
}: {
  post: FeedPost;
  initialComments: ArticleComment[];
}) {
  const { member, requireMember, openAuth } = useCommunity();
  const [saved, setSaved] = useState(post.bookmarked);
  const [reacted, setReacted] = useState(post.reacted);
  const [count, setCount] = useState(post.reactions);
  const [comments, setComments] = useState(initialComments);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function interact(action: "bookmark" | "react") {
    if (!requireMember()) return;
    setPending(true);
    setError("");
    try {
      const result = await communityRequest<{
        enabled: boolean;
        count: number;
      }>(action, {
        postId: post.id,
        enabled: action === "bookmark" ? !saved : !reacted,
      });
      if (action === "bookmark") setSaved(result.enabled);
      else {
        setReacted(result.enabled);
        setCount(result.count);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  async function addComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireMember()) return;
    const form = event.currentTarget;
    setPending(true);
    setError("");
    try {
      const result = await communityRequest<{ comment: ArticleComment }>(
        "comment",
        { postId: post.id, body: new FormData(form).get("body") },
      );
      setComments((current) => [...current, result.comment]);
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="article-actions">
        <button
          disabled={pending}
          onClick={() => interact("react")}
          aria-pressed={reacted}
        >
          <Heart size={17} fill={reacted ? "currentColor" : "none"} />
          {count} reactions
        </button>
        <button
          disabled={pending}
          onClick={() => interact("bookmark")}
          aria-pressed={saved}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save story"}
        </button>
      </div>
      {error && (
        <p role="alert" className="form-message error">
          {error}
        </p>
      )}
      <section id="comments" className="comments-section">
        <h2>Join the conversation</h2>
        {comments.map((comment) => (
          <article key={comment.id} className="comment">
            <div>
              <span className="member-avatar">
                {initials(comment.user.name)}
              </span>
              <strong>{comment.user.name}</strong>
              <time dateTime={comment.createdAt}>
                {formatDate(comment.createdAt)}
              </time>
            </div>
            <p>{comment.body}</p>
          </article>
        ))}
        {post.comments > comments.length && (
          <button
            className="text-button"
            onClick={() => {
              router.refresh();
            }}
          >
            Refresh comments
          </button>
        )}
        {member ? (
          <form onSubmit={addComment} className="stacked-form">
            <label>
              Your comment
              <textarea
                name="body"
                required
                maxLength={2000}
                placeholder="Add your perspective…"
              />
            </label>
            <button className="button green" disabled={pending}>
              {pending ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <div className="empty-state">
            <p>Have something to add? We’d love to hear it.</p>
            <button className="button green" onClick={openAuth}>
              Sign in to comment
            </button>
          </div>
        )}
      </section>
    </>
  );
}
