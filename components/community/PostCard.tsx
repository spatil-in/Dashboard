"use client";

import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Play } from "lucide-react";
import { useState } from "react";
import { communityRequest } from "@/lib/community/client";
import { type FeedPost, formatDate } from "@/lib/community/types";
import MediaSkeleton from "./MediaSkeleton";
import { useCommunity } from "./CommunityProvider";

export default function PostCard({ post }: { post: FeedPost }) {
  const { requireMember } = useCommunity();
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [reacted, setReacted] = useState(post.reacted);
  const [reactions, setReactions] = useState(post.reactions);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const sponsored = post.category === "Sponsored";
  const event = ["Events & Meetups", "Hackathons"].includes(post.category);

  async function interact(action: "bookmark" | "react") {
    if (!requireMember() || busy) return;
    setBusy(action);
    setError("");
    try {
      const result = await communityRequest<{
        enabled: boolean;
        count: number;
      }>(action, {
        postId: post.id,
        enabled: action === "bookmark" ? !bookmarked : !reacted,
      });
      if (action === "bookmark") setBookmarked(result.enabled);
      else {
        setReacted(result.enabled);
        setReactions(result.count);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article
      className={`post-card ${sponsored ? "sponsored-post" : ""} ${event ? "event-post" : ""}`}
    >
      <div className="post-category">
        <Link href={`/?category=${encodeURIComponent(post.category)}`}>
          /{" "}
          {post.category === "Events & Meetups"
            ? "Events"
            : post.category === "Whitepapers"
              ? "Whitepaper"
              : post.category}
        </Link>
      </div>
      <Link
        href={`/posts/${post.slug}`}
        className="post-media-link"
        aria-label={`Read ${post.title}`}
      >
        <MediaSkeleton src={post.imageUrl} alt={post.title} />
        {post.category === "Videos" && (
          <span className="video-timeline">
            <Play size={20} fill="currentColor" />
            <i />
          </span>
        )}
      </Link>
      {!sponsored && (
        <div className="post-content">
          <div className="post-meta">
            <time dateTime={post.eventDate || post.publishedAt}>
              {formatDate(post.eventDate || post.publishedAt)}
            </time>
            {!event && (
              <>
                <span className="meta-divider">|</span>
                <Link
                  href={`/members/${post.author.id}`}
                  className="author-link"
                >
                  {post.author.name}
                </Link>
              </>
            )}
            <button
              className={`bookmark-button ${bookmarked ? "is-saved" : ""}`}
              onClick={() => interact("bookmark")}
              disabled={busy !== null}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this post"}
              aria-pressed={bookmarked}
            >
              <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
          <h2>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="post-excerpt">{post.excerpt}</p>
          {post.category === "Forum" && post.featuredComment && (
            <div className="forum-preview">
              <strong>{post.featuredComment.name}</strong>
              <blockquote>{post.featuredComment.body}</blockquote>
              <Link href={`/posts/${post.slug}#comments`}>
                See the conversation
              </Link>
            </div>
          )}
          <div className="post-bottom">
            <div className="post-tags">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`}>
                  <span>#</span>
                  {tag}
                </Link>
              ))}
            </div>
            {event ? (
              <div className="event-meta">
                <span>
                  {post.participants > 0 && (
                    <>
                      <strong>
                        {post.participants.toLocaleString("en-US")}
                      </strong>{" "}
                      participants
                    </>
                  )}
                </span>
                <span>{post.location}</span>
              </div>
            ) : (
              <div className="post-engagement">
                <button
                  onClick={() => interact("react")}
                  className={reacted ? "has-reacted" : ""}
                  disabled={busy !== null}
                  aria-pressed={reacted}
                >
                  <span className="reaction-hearts" aria-hidden="true">
                    <Heart size={13} fill="currentColor" />
                    <Heart size={12} fill="currentColor" />
                    <span>✦</span>
                  </span>
                  {reactions} reactions
                </button>
                <Link href={`/posts/${post.slug}#comments`}>
                  <MessageCircle size={16} />
                  {post.comments} comments
                </Link>
              </div>
            )}
          </div>
          {error && (
            <p className="form-message error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
