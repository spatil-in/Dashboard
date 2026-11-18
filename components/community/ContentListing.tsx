"use client";
import Link from "next/link";
import { useState } from "react";
import { Play, Search } from "lucide-react";
import type { FeedPage } from "@/lib/community/types";
import { formatDate } from "@/lib/community/types";
import PostCard from "./PostCard";
import MediaSkeleton from "./MediaSkeleton";

export default function ContentListing({
  category,
  initial,
}: {
  category: string;
  initial: FeedPage;
}) {
  const [feed, setFeed] = useState(initial);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [publisher, setPublisher] = useState("All");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const video = category === "Videos";
  const whitepaper = category === "Whitepapers";
  const tags = ["All", ...new Set(feed.posts.flatMap((post) => post.tags))];
  const visible = feed.posts.filter(
    (post) =>
      (!query ||
        `${post.title} ${post.excerpt}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (tag === "All" || post.tags.includes(tag)) &&
      (publisher === "All" || post.company === publisher),
  );
  const featured = feed.posts[0];
  async function more() {
    setPending(true);
    try {
      const response = await fetch(
        `/api/community?category=${category}&page=${feed.page + 1}`,
      );
      if (!response.ok)
        throw new Error("Could not load more. Please try again.");
      const next: FeedPage = await response.json();
      setFeed((current) => ({
        ...next,
        posts: [...current.posts, ...next.posts],
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      className={`content-listing ${video ? "video-listing" : whitepaper ? "whitepaper-listing" : "blog-listing"}`}
    >
      <h1>/{category}</h1>
      {!video && featured && (
        <Link
          className={`listing-hero ${whitepaper ? "paper-hero" : ""}`}
          href={`/posts/${featured.slug}`}
        >
          {!whitepaper && (
            <>
              <div className="browser-dots">🔴 🟡 🟢</div>
              <MediaSkeleton src={featured.imageUrl} alt={featured.title} />
            </>
          )}
          <div className="listing-hero-copy">
            <div className="post-meta">
              {formatDate(featured.publishedAt)} <span>|</span>
              <span className="author-link">{featured.author.name}</span>
            </div>
            <h2>{featured.title}</h2>
            <div className="post-tags">
              {featured.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </Link>
      )}
      <div className="listing-filters">
        {whitepaper ? (
          <>
            <label>
              Topics
              <select
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              >
                {tags.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Company
              <select
                value={publisher}
                onChange={(event) => setPublisher(event.target.value)}
              >
                <option>All</option>
                {[
                  ...new Set(
                    feed.posts.flatMap((post) =>
                      post.company ? [post.company] : [],
                    ),
                  ),
                ].map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <div className="listing-search">
              <span>{video ? "Explore videos" : "Browse by categories"}</span>
              <label>
                <Search size={16} />
                <input
                  aria-label={`Search ${category}`}
                  placeholder={`Search ${category}`}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </div>
            <div className="listing-tags">
              {tags.map((item) => (
                <button
                  key={item}
                  aria-pressed={tag === item}
                  onClick={() => setTag(item)}
                >
                  {video ? "" : "#"}
                  {item.toLowerCase()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className={video ? "video-catalog-layout" : ""}>
        <div
          className={`listing-results ${video ? "video-grid" : whitepaper ? "paper-grid" : "blog-rows"}`}
        >
          {visible.map((post, index) =>
            video ? (
              <article key={post.id}>
                <Link href={`/posts/${post.slug}`}>
                  <div className={`catalog-video color-${index % 5}`}>
                    <Play size={36} />
                    <span className="sr-only">Open video</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>
                    {post.author.name} · {formatDate(post.publishedAt)}
                  </p>
                </Link>
              </article>
            ) : (
              <PostCard post={post} key={post.id} />
            ),
          )}
        </div>
        {video && (
          <aside className="trending-videos">
            <h2>Trending Videos</h2>
            {feed.posts.slice(0, 4).map((post, index) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <i className={`color-${index % 5}`} />
                <span>{post.title}</span>
              </Link>
            ))}
          </aside>
        )}
      </div>
      {!visible.length && (
        <div className="empty-state">No content matches your filters.</div>
      )}
      {error && <p role="alert">{error}</p>}
      {feed.hasMore && (
        <div className="load-more">
          <button className="button outline" disabled={pending} onClick={more}>
            {pending ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
