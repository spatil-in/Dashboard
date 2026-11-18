export type Member = {
  id: number;
  name: string;
  bio: string | null;
  specialty: string | null;
};

export type FeedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  company: string | null;
  imageUrl: string | null;
  mediaUrl: string | null;
  tags: string[];
  publishedAt: string;
  author: { id: number; name: string };
  reactions: number;
  comments: number;
  bookmarked: boolean;
  reacted: boolean;
  eventDate: string | null;
  location: string | null;
  participants: number;
  featuredComment: { name: string; body: string } | null;
};

export type FeedPage = { posts: FeedPost[]; hasMore: boolean; page: number };
export type DiscoveryData = {
  trending: { slug: string; title: string; readCount: number }[];
  authors: (Member & { following: boolean })[];
  events: {
    slug: string;
    title: string;
    eventDate: string | null;
    location: string | null;
  }[];
  videos: { slug: string; title: string; imageUrl: string | null }[];
  poll: {
    id: number;
    question: string;
    votedOption: number | null;
    options: { id: number; label: string; votes: number }[];
  } | null;
  members: number;
};

export const categories = [
  "News",
  "Blogs",
  "Whitepapers",
  "Videos",
  "Podcasts",
  "Forum",
  "Hackathons",
  "Events & Meetups",
  "Upskilling",
  "AI Marketplace",
  "API Marketplace",
];

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
