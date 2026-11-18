"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
export default function MemberFeedTabs() {
  const params = useSearchParams();
  const latest = params.get("sort") === "latest";
  return (
    <div className="member-feed-tabs">
      <div>
        <Link className={!latest ? "selected" : ""} href="/">
          For You
        </Link>
        <Link className={latest ? "selected" : ""} href="/?sort=latest">
          Latest
        </Link>
      </div>
      <div>
        {[
          "All",
          "Python",
          "JavaScript",
          "Java",
          "Devops",
          "C++",
          "C#",
          "Cloud",
          "Security",
          "Ruby",
        ].map((topic) => (
          <Link
            key={topic}
            className={
              (params.get("q") || "All").toLowerCase() === topic.toLowerCase()
                ? "active"
                : ""
            }
            href={
              topic === "All"
                ? "/"
                : `/?q=${encodeURIComponent(topic.toLowerCase())}`
            }
          >
            {topic}
          </Link>
        ))}
      </div>
    </div>
  );
}
