"use client";

import Link from "next/link";
import { Bell, MessageSquare, LogOut, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { communityRequest } from "@/lib/community/client";
import { initials } from "@/lib/community/types";
import { useCommunity } from "./community/CommunityProvider";
import Brand from "./community/Brand";

export default function Header() {
  const { member, setMember, openAuth, openSubscribe } = useCommunity();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signout() {
    setPending(true);
    try {
      await communityRequest("signout");
      setMember(null);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <header className="site-header">
      <div className="header-brand">
        <Brand />
      </div>
      <form className="header-search" action="/" role="search">
        <Search size={19} />
        <input
          name="q"
          placeholder="Search here ..."
          aria-label="Search articles and discussions"
          maxLength={150}
        />
        <button className="sr-only" type="submit">
          Search
        </button>
      </form>
      <div className="header-actions">
        {member && <><Link className="header-icon" href="/profile" aria-label="Account settings"><Bell size={18}/></Link><Link className="header-icon" href="/?category=Forum" aria-label="Community conversations"><MessageSquare size={18}/></Link></>}
        <button className="button dark" onClick={openSubscribe}>
          Subscribe
        </button>
        {member ? (
          <details className="account-menu">
            <summary aria-label="Open account menu">
              <span className="member-avatar">{initials(member.name)}</span>
              <span className="account-name">{member.name.split(" ")[0]}</span>
            </summary>
            <div>
              <strong>{member.name}</strong>
              <Link href="/profile">
                <UserRound size={16} />
                My profile
              </Link>
              <Link href="/?view=bookmarks">Saved posts</Link>
              <button disabled={pending} onClick={signout}>
                <LogOut size={16} />
                {pending ? "Signing out…" : "Sign out"}
              </button>
              {error && <p role="alert">{error}</p>}
            </div>
          </details>
        ) : (
          <button className="button green" onClick={openAuth}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
