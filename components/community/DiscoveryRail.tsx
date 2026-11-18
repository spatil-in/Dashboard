"use client";

import Link from "next/link";
import {
  CalendarDays,
  Check,
  Code,
  Mail,
  PencilLine,
  Play,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type DiscoveryData, initials } from "@/lib/community/types";
import { communityRequest } from "@/lib/community/client";
import { useCommunity } from "./CommunityProvider";
import NewsletterForm from "./NewsletterForm";

export default function DiscoveryRail({ data }: { data: DiscoveryData }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  async function invite() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/`);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError(
        "Copy this link to invite a friend: " + window.location.origin,
      );
    }
  }
  return (
    <aside className="discovery-rail" aria-label="Discover the community">
      <div className="ad-space">Ad space</div>
      <section className="rail-widget trending-widget">
        <h2>
          <TrendingUp />
          Trending today
        </h2>
        {data.trending.length ? (
          <ol>
            {data.trending.map((post, index) => (
              <li key={post.slug}>
                <span className="read-count">
                  {Intl.NumberFormat("en", { notation: "compact" }).format(
                    post.readCount,
                  )}{" "}
                  reads
                </span>
                <Link href={`/posts/${post.slug}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{post.title}</strong>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="widget-empty">The next big story starts here.</p>
        )}
      </section>
      <Link className="contributor-banner" href="/write">
        <div>
          <strong>
            Write for
            <br />
            Frontline Code
          </strong>
          <PencilLine size={34} />
        </div>
        <span>
          <Code size={58} />
          <small>
            Share your expertise with the developer community. We publish
            technical tutorials, opinion pieces, and deep dives.
          </small>
        </span>
      </Link>
      <section className="rail-widget follow-widget">
        <h2>
          <UserRoundPlus />
          Who to follow
        </h2>
        {data.authors.map((author) => (
          <FollowRow key={`${author.id}-${author.following}`} author={author} />
        ))}
        {data.authors.length === 0 && (
          <p className="widget-empty">
            Meet our contributors as the community grows.
          </p>
        )}
      </section>
      <section className="newsletter-widget">
        <div>
          <h2>
            Subscribe to *<br />- Our Newsletter
          </h2>
          <Mail size={36} fill="white" stroke="#1d1d1f" />
        </div>
        <p>
          Stay ahead with the latest tech news, insights, trends, and developer
          updates delivered to your inbox
        </p>
        <NewsletterForm />
      </section>
      <section className="rail-widget events-widget">
        <h2>
          <CalendarDays />
          Upcoming events
        </h2>
        {data.events.map((event) => {
          const date = new Date(event.eventDate || "");
          return (
            <Link
              key={event.slug}
              className="event-row"
              href={`/posts/${event.slug}`}
            >
              <span className="event-date">
                <small>
                  {date
                    .toLocaleDateString("en", {
                      month: "short",
                      timeZone: "Asia/Kolkata",
                    })
                    .toUpperCase()}
                </small>
                <strong>
                  {date.toLocaleDateString("en", {
                    day: "2-digit",
                    timeZone: "Asia/Kolkata",
                  })}
                </strong>
              </span>
              <span>
                <strong>{event.title}</strong>
                <small>{event.location}</small>
              </span>
            </Link>
          );
        })}
        {data.events.length === 0 && (
          <p className="widget-empty">New events will appear here.</p>
        )}
      </section>
      <section className="rail-widget videos-widget">
        <div className="widget-heading">
          <h2>Videos</h2>
          <Link href="/?category=Videos">See all →</Link>
        </div>
        {data.videos.map((video, index) => (
          <Link
            href={`/posts/${video.slug}`}
            className={`video-teaser video-${index}`}
            key={video.slug}
          >
            <span className="video-placeholder" />
            <span className="play-icon">
              <Play size={14} fill="currentColor" />
            </span>
            <div>
              <span className="video-tag">Watch</span>
              <p>{video.title}</p>
            </div>
          </Link>
        ))}
        {data.videos.length === 0 && (
          <p className="widget-empty">Video stories are coming soon.</p>
        )}
        <Link className="see-all" href="/?category=Videos">
          See all →
        </Link>
      </section>
      {data.poll && (
        <WeeklyPoll
          key={`${data.poll.id}-${data.poll.votedOption}-${data.poll.options.reduce((sum, option) => sum + option.votes, 0)}`}
          poll={data.poll}
        />
      )}
      <section className="rail-widget members-widget">
        <h2>{data.members.toLocaleString("en-US")} members</h2>
        <p>A growing community of developers and technology thinkers.</p>
        <div className="member-stack">
          {data.authors.map((author) => (
            <span className="member-avatar" key={author.id}>
              {initials(author.name)}
            </span>
          ))}
        </div>
        <div className="members-actions">
          <button className="button green" onClick={invite}>
            {copied ? (
              <>
                <Check size={13} />
                Link copied
              </>
            ) : (
              "Invite Connections"
            )}
          </button>
          <Link href="/members">See all →</Link>
        </div>
        {copyError && (
          <p className="form-message" role="status">
            {copyError}
          </p>
        )}
      </section>
    </aside>
  );
}

function FollowRow({ author }: { author: DiscoveryData["authors"][number] }) {
  const { requireMember } = useCommunity();
  const [following, setFollowing] = useState(author.following);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function follow() {
    if (!requireMember()) return;
    setPending(true);
    setError("");
    try {
      const result = await communityRequest<{ enabled: boolean }>("follow", {
        memberId: author.id,
        enabled: !following,
      });
      setFollowing(result.enabled);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="follow-item">
      <div className="follow-row">
        <Link className="member-avatar" href={`/members/${author.id}`}>
          {initials(author.name)}
        </Link>
        <Link className="follow-name" href={`/members/${author.id}`}>
          <strong>{author.name}</strong>
          <small>{author.specialty}</small>
        </Link>
        <button onClick={follow} disabled={pending} aria-pressed={following}>
          {following ? "Following" : "+ Follow"}
        </button>
      </div>
      {error && (
        <p className="form-message error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function WeeklyPoll({ poll }: { poll: NonNullable<DiscoveryData["poll"]> }) {
  const { requireMember } = useCommunity();
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(poll.votedOption);
  const [results, setResults] = useState(poll.votedOption !== null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0);
  async function vote(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !requireMember()) return;
    setPending(true);
    try {
      await communityRequest("vote", { optionId: selected });
      setResults(true);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="rail-widget poll-widget">
      <h2>
        <TrendingUp />
        Weekly poll
      </h2>
      <h3>{poll.question}</h3>
      <form onSubmit={vote}>
        {poll.options.map((option) => (
          <label key={option.id} className="poll-option">
            <input
              type="radio"
              name="poll"
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
              disabled={poll.votedOption !== null}
              required
            />
            <span>{option.label}</span>
            {results && (
              <>
                <strong>
                  {total ? Math.round((option.votes / total) * 100) : 0}%
                </strong>
                <i
                  style={{
                    width: `${total ? (option.votes / total) * 100 : 0}%`,
                  }}
                />
              </>
            )}
          </label>
        ))}
        <div className="poll-actions">
          {!poll.votedOption && (
            <button className="button green" disabled={pending || !selected}>
              {pending ? "Voting…" : "Vote"}
            </button>
          )}
          <button
            type="button"
            className="text-button"
            onClick={() => setResults(!results)}
          >
            {results ? "Hide results" : "View Results"} →
          </button>
        </div>
        {results && (
          <small className="poll-total">
            {total} votes{poll.votedOption ? " · Thanks for voting" : ""}
          </small>
        )}
        {error && (
          <p role="alert" className="form-message error">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
