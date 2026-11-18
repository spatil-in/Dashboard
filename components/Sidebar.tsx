"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  CalendarDays,
  FileText,
  Home,
  LayoutPanelLeft,
  Mail,
  MessageSquare,
  Mic,
  Newspaper,
  Plug,
  Bot,
  Trophy,
  UserRound,
  Video,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useCommunity } from "./community/CommunityProvider";

const groups = [
  {
    label: "MEDIA & CONTENT",
    items: [
      { title: "News", icon: Newspaper },
      { title: "Blogs", icon: BookOpen },
      { title: "Whitepapers", icon: FileText },
      { title: "Videos", icon: Video },
      { title: "Podcasts", icon: Mic },
      { title: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { title: "Forum", icon: MessageSquare },
      { title: "Hackathons", icon: Trophy },
      { title: "Events & Meetups", icon: CalendarDays },
      { title: "Upskilling", icon: LayoutPanelLeft },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { title: "AI Marketplace", icon: Bot },
      { title: "API Marketplace", icon: Plug },
    ],
  },
];

export default function Sidebar() {
  const params = useSearchParams();
  const pathname = usePathname();
  const category = params.get("category");
  const { member, openAuth, openSubscribe } = useCommunity();
  const [expanded, setExpanded] = useState(false);
  const home = pathname === "/" && !category && !params.get("view");
  return (
    <aside className={`site-sidebar ${expanded ? "expanded" : ""}`}>
      <button
        className="mobile-nav-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <Menu size={18} />
        Explore Frontline Code
      </button>
      <nav aria-label="Main navigation" onClick={() => setExpanded(false)}>
        <Link href="/" className={`sidebar-link ${home ? "active" : ""}`}>
          <Home size={19} />
          <span>Home</span>
        </Link>
        {groups.map((group) => (
          <section className="nav-group" key={group.label}>
            <h2>{group.label}</h2>
            {group.items.map((item) =>
              item.title === "Newsletter" ? (
                <button
                  className="sidebar-link"
                  key={item.title}
                  onClick={openSubscribe}
                >
                  <item.icon size={19} />
                  <span>{item.title}</span>
                </button>
              ) : (
                <Link
                  className={`sidebar-link ${(pathname === "/" && category === item.title) || pathname === ({ Blogs: "/blogs", Whitepapers: "/whitepapers", Videos: "/videos" } as Record<string, string>)[item.title] ? "active" : ""}`}
                  key={item.title}
                  href={
                    (
                      {
                        Blogs: "/blogs",
                        Whitepapers: "/whitepapers",
                        Videos: "/videos",
                      } as Record<string, string>
                    )[item.title] ||
                    `/?category=${encodeURIComponent(item.title)}`
                  }
                >
                  <item.icon size={19} />
                  <span>{item.title}</span>
                  {item.title === "Hackathons" && <small>Live</small>}
                  {item.title === "Events & Meetups" && <small>New</small>}
                </Link>
              ),
            )}
          </section>
        ))}
        <section className="nav-group personal">
          <h2>PERSONAL</h2>
          {member ? (
            <>
              <Link
                href="/profile"
                className={`sidebar-link ${pathname === "/profile" ? "active" : ""}`}
              >
                <UserRound size={19} />
                <span>Profile</span>
              </Link>
              <Link
                href="/?view=bookmarks"
                className={`sidebar-link ${params.get("view") === "bookmarks" ? "active" : ""}`}
              >
                <Bookmark size={19} />
                <span>Bookmarks</span>
              </Link>
            </>
          ) : (
            <>
              <button className="sidebar-link" onClick={openAuth}>
                <UserRound size={19} />
                <span>Profile</span>
              </button>
              <button className="sidebar-link" onClick={openAuth}>
                <Bookmark size={19} />
                <span>Bookmarks</span>
              </button>
            </>
          )}
        </section>
      </nav>
    </aside>
  );
}
