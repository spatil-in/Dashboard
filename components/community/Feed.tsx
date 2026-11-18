"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { useState } from "react";
import type { FeedPage } from "@/lib/community/types";
import MemberFeedTabs from "./MemberFeedTabs";
import PostCard from "./PostCard";
import { useCommunity } from "./CommunityProvider";

export default function Feed({
  initial,
  category = "",
  query = "",
  bookmarks = false,
}: {
  initial: FeedPage;
  category?: string;
  query?: string;
  bookmarks?: boolean;
}) {
  const searchParams = useSearchParams();
  const { member, openAuth } = useCommunity();
  const [feed, setFeed] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function loadMore() {
    setPending(true);
    setError("");
    try {
      const params = new URLSearchParams({
        sort: searchParams.get("sort") || "",
        category,
        q: query,
        page: String(feed.page + 1),
        bookmarks: String(bookmarks),
      });
      const response = await fetch(`/api/community?${params}`);
      if (!response.ok)
        throw new Error("We couldn’t load more stories. Please try again.");
      const next: FeedPage = await response.json();
      setFeed((current) => ({
        ...next,
        posts: [
          ...current.posts,
          ...next.posts.filter(
            (post) =>
              !current.posts.some((existing) => existing.id === post.id),
          ),
        ],
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="feed-column" aria-label="Community feed">
      {member ? (
        <MemberFeedTabs />
      ) : (
        <div className="write-prompt">
          <Pencil size={24} />
          <strong>Write to think. Publish to connect.</strong>
          <Link className="button outline" href="/write">
            Write for us
          </Link>
        </div>
      )}
      {(category || query || bookmarks) && (
        <div className="feed-filter-heading">
          <h1>
            {bookmarks
              ? "Your bookmarks"
              : query
                ? `Search results for “${query}”`
                : category}
          </h1>
          <Link href="/">Back to home</Link>
        </div>
      )}
      {bookmarks && !member ? (
        <div className="empty-state">
          <h2>Your next great read, saved.</h2>
          <p>Sign in to see your bookmarked stories.</p>
          <button className="button green" onClick={openAuth}>
            Sign in
          </button>
        </div>
      ) : (
        <>
          <div className="post-list">
            {feed.posts.map((post) => (
              <PostCard
                key={`${post.id}-${member?.id ?? "guest"}`}
                post={post}
              />
            ))}
          </div>
          {feed.posts.length === 0 && (
            <div className="empty-state">
              <h2>
                {query ? "No stories found" : "More stories are on the way."}
              </h2>
              <p>
                {query
                  ? "Try another search or explore the home feed."
                  : "Published content will appear here as it’s added."}
              </p>
              <Link href="/" className="button outline">
                Explore home
              </Link>
            </div>
          )}
          {error && (
            <p className="form-message error" role="alert">
              {error}
            </p>
          )}
          {feed.hasMore && (
            <div className="load-more">
              <button
                className="button outline"
                onClick={loadMore}
                disabled={pending}
              >
                {pending ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
          {!feed.hasMore && feed.posts.length > 0 && (
            <div className="feed-end">You’re all caught up.</div>
          )}
        </>
      )}
    </section>
  );
}
