import "server-only";
import { prisma } from "@/lib/prisma";
import { publicMember } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
import type { DiscoveryData, FeedPage, FeedPost } from "./types";

export const postInclude = (memberId?: number) =>
  ({
    author: { select: { id: true, name: true } },
    _count: { select: { reactions: true, comments: true } },
    bookmarks: { where: { userId: memberId ?? -1 }, select: { userId: true } },
    reactions: { where: { userId: memberId ?? -1 }, select: { userId: true } },
    comments: {
      take: 1,
      orderBy: { createdAt: "asc" },
      select: { body: true, user: { select: { name: true } } },
    },
  }) satisfies Prisma.PostInclude;

type PostRecord = Prisma.PostGetPayload<{
  include: ReturnType<typeof postInclude>;
}>;

export function serializePost(post: PostRecord): FeedPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    company: post.company,
    imageUrl: post.imageUrl,
    mediaUrl: post.mediaUrl,
    tags: Array.isArray(post.tags)
      ? post.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    publishedAt: post.publishedAt.toISOString(),
    author: post.author,
    reactions: post._count.reactions,
    comments: post._count.comments,
    bookmarked: post.bookmarks.length > 0,
    reacted: post.reactions.length > 0,
    eventDate: post.eventDate?.toISOString() ?? null,
    location: post.location,
    participants: post.participants,
    featuredComment: post.comments[0]
      ? { name: post.comments[0].user.name, body: post.comments[0].body }
      : null,
  };
}

export async function getFeed({
  category = "",
  query = "",
  page = 1,
  memberId,
  bookmarks = false,
  latest = false,
}: {
  category?: string;
  query?: string;
  page?: number;
  memberId?: number;
  bookmarks?: boolean;
  latest?: boolean;
}): Promise<FeedPage> {
  const take = category === "Blogs" ? 8 : ["Whitepapers", "Videos"].includes(category) ? 12 : 14;
  const where: Prisma.PostWhereInput = { published: true };
  if (category) where.category = category;
  if (memberId && !category && !query && !bookmarks && !latest) {
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { topics: true },
    });
    const topicTags: Record<string, string[]> = {
      "AI & Tooling": ["ai", "tooling"],
      DevOps: ["devops", "cloud"],
      Frontend: ["javascript", "reactjs", "frontend"],
      Backend: ["backend", "java", "python"],
      Career: ["career"],
      Security: ["security", "cybersecurity"],
      "Open Source": ["opensource"],
      Design: ["design"],
    };
    if (Array.isArray(member?.topics) && member.topics.length) {
      const terms = member.topics.flatMap((topic) =>
        typeof topic === "string" ? topicTags[topic] || [] : [],
      );
      where.AND = [
        { OR: terms.map((term) => ({ tags: { array_contains: term } })) },
      ];
    }
  }
  if (query)
    where.OR = [
      { title: { contains: query } },
      { excerpt: { contains: query } },
      { tags: { array_contains: query } },
    ];
  if (bookmarks) where.bookmarks = { some: { userId: memberId ?? -1 } };
  const rows = await prisma.post.findMany({
    where,
    orderBy: ["Blogs", "Whitepapers", "Videos"].includes(category)
      ? [{ sortOrder: "desc" }, { id: "asc" }]
      : latest
        ? [{ publishedAt: "desc" }, { id: "desc" }]
        : [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    skip: (page - 1) * take,
    take: take + 1,
    include: postInclude(memberId),
  });
  return {
    posts: rows.slice(0, take).map(serializePost),
    hasMore: rows.length > take,
    page,
  };
}

export async function getDiscovery(memberId?: number): Promise<DiscoveryData> {
  const [trending, authors, events, videos, poll, members] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, category: { not: "Sponsored" } },
      orderBy: { readCount: "desc" },
      take: 4,
      select: { slug: true, title: true, readCount: true },
    }),
    prisma.user.findMany({
      where: { isAuthor: true, id: { not: memberId ?? -1 } },
      take: 3,
      orderBy: { id: "asc" },
      select: {
        ...publicMember,
        followers: {
          where: { followerId: memberId ?? -1 },
          select: { followerId: true },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        published: true,
        category: "Events & Meetups",
        eventDate: { gte: new Date() },
      },
      orderBy: { eventDate: "asc" },
      take: 3,
      select: { slug: true, title: true, eventDate: true, location: true },
    }),
    prisma.post.findMany({
      where: { published: true, category: "Videos" },
      take: 3,
      select: { slug: true, title: true, imageUrl: true },
    }),
    prisma.poll.findFirst({
      where: { active: true },
      orderBy: { id: "desc" },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
            votes: {
              where: { userId: memberId ?? -1 },
              select: { userId: true },
            },
          },
        },
      },
    }),
    prisma.user.count(),
  ]);
  return {
    trending,
    authors: authors.map(({ followers, ...author }) => ({
      ...author,
      following: followers.length > 0,
    })),
    events: events.map((event) => ({
      ...event,
      eventDate: event.eventDate?.toISOString() ?? null,
    })),
    videos,
    members,
    poll: poll
      ? {
          id: poll.id,
          question: poll.question,
          votedOption:
            poll.options.find((option) => option.votes.length > 0)?.id ?? null,
          options: poll.options.map((option) => ({
            id: option.id,
            label: option.label,
            votes: option._count.votes,
          })),
        }
      : null,
  };
}
