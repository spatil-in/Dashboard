"use client";

import Link from "next/link";
import Brand from "./community/Brand";
import { useCommunity } from "./community/CommunityProvider";

export default function Footer() {
  const { openSubscribe } = useCommunity();
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-top">
          <div>
            <Brand footer />
            <p>
              A community for developers.
              <br />
              Ideas that move technology forward.
            </p>
          </div>
          <div>
            <h2>MEDIA & CONTENT</h2>
            {["News", "Blogs", "Videos", "Podcasts"].map((label) => (
              <Link key={label} href={`/?category=${label}`}>
                {label}
              </Link>
            ))}
            <button onClick={openSubscribe}>Newsletter</button>
          </div>
          <div>
            <h2>COMMUNITY</h2>
            {["Forum", "Hackathons", "Events & Meetups", "Upskilling"].map(
              (label) => (
                <Link
                  key={label}
                  href={`/?category=${encodeURIComponent(label)}`}
                >
                  {label === "Upskilling" ? "Guides" : label}
                </Link>
              ),
            )}
          </div>
          <div>
            <h2>TOOLS</h2>
            <Link href="/?category=AI%20Marketplace">AI Marketplace</Link>
            <Link href="/?category=API%20Marketplace">API Marketplace</Link>
          </div>
          <div>
            <h2>EXPLORE</h2>
            <Link href="/info/about">About us</Link>
            <Link href="/info/contact">Contact us</Link>
            <Link href="/write">Write for us</Link>
          </div>
        </div>
        <div className="footer-legal">
          <span>© Copyright 2026 Frontline Code. All rights reserved.</span>
          <Link href="/info/privacy">Privacy Policy | CCPA</Link>
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        Front/ine
      </div>
    </footer>
  );
}
