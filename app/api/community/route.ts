import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkAuthRateLimit,
  endSession,
  getCurrentMember,
  hashPassword,
  publicMember,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { getFeed } from "@/lib/community/data";
import { categories } from "@/lib/community/types";

class InputError extends Error {}

function text(value: unknown, label: string, min: number, max: number): string {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw new InputError(
      `${label} must be between ${min} and ${max} characters.`,
    );
  return value.trim();
}

function emailAddress(value: unknown) {
  const email = text(value, "Email", 3, 191).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new InputError("Enter a valid email address.");
  return email;
}

function recordId(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    throw new InputError("Invalid record.");
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const member = await getCurrentMember();
    const params = request.nextUrl.searchParams;
    const page = Math.min(1000, Math.max(1, Number(params.get("page")) || 1));
    const feed = await getFeed({
      category: params.get("category") || "",
      query: (params.get("q") || "").slice(0, 150),
      page: Math.floor(page),
      memberId: member?.id,
      bookmarks: params.get("bookmarks") === "true",
      latest: params.get("sort") === "latest",
    });
    return NextResponse.json(feed, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Feed request failed", error);
    return NextResponse.json(
      { error: "The feed is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 100_000)
    return NextResponse.json(
      { error: "Request is too large." },
      { status: 413 },
    );

  try {
    const input = await request.json();
    if (!input || typeof input !== "object")
      throw new InputError("Invalid request.");
    const action = input.action;

    if (action === "subscribe") {
      const email = emailAddress(input.email);
      await checkAuthRateLimit(`subscribe:${email}`);
      await prisma.subscription.upsert({
        where: { email },
        create: { email },
        update: {},
      });
      return NextResponse.json({
        message: "You’re on the list! Your newsletter subscription is saved.",
      });
    }

    if (action === "signup" || action === "signin") {
      const email = emailAddress(input.email);
      const password = text(input.password, "Password", 10, 128);
      await checkAuthRateLimit(`auth:${email}`);
      let member;
      if (action === "signup") {
        const name = text(input.name, "Name", 2, 100);
        member = await prisma.user.create({
          data: { name, email, passwordHash: await hashPassword(password) },
          select: publicMember,
        });
      } else {
        const user = await prisma.user.findUnique({ where: { email } });
        if (
          !(await verifyPassword(password, user?.passwordHash ?? null)) ||
          !user
        )
          return NextResponse.json(
            { error: "Email or password is incorrect." },
            { status: 401 },
          );
        member = {
          id: user.id,
          name: user.name,
          bio: user.bio,
          specialty: user.specialty,
        };
      }
      await startSession(member.id);
      return NextResponse.json({ member, message: "You’re signed in." });
    }

    const member = await getCurrentMember();
    if (!member)
      return NextResponse.json(
        { error: "Sign in to continue." },
        { status: 401 },
      );
    if (action === "topics") {
      const allowed = [
        "AI & Tooling",
        "DevOps",
        "Frontend",
        "Backend",
        "Career",
        "Security",
        "Open Source",
        "Design",
      ];
      if (
        !Array.isArray(input.topics) ||
        !input.topics.length ||
        input.topics.some(
          (topic: unknown) =>
            typeof topic !== "string" || !allowed.includes(topic),
        )
      )
        throw new InputError("Choose valid topics.");
      await prisma.user.update({
        where: { id: member.id },
        data: { topics: [...new Set(input.topics as string[])] },
      });
      return NextResponse.json({ message: "Your topics are saved." });
    }
    if (action === "signout") {
      await endSession();
      return NextResponse.json({ message: "You’re signed out." });
    }

    if (action === "bookmark" || action === "react") {
      const postId = recordId(input.postId);
      if (typeof input.enabled !== "boolean")
        throw new InputError("Invalid selection.");
      const post = await prisma.post.findFirst({
        where: { id: postId, published: true },
        select: { id: true },
      });
      if (!post)
        return NextResponse.json(
          { error: "This post is unavailable." },
          { status: 404 },
        );
      const key = { userId: member.id, postId };
      if (action === "bookmark") {
        if (input.enabled)
          await prisma.bookmark.upsert({
            where: { userId_postId: key },
            create: key,
            update: {},
          });
        else await prisma.bookmark.deleteMany({ where: key });
      } else {
        if (input.enabled)
          await prisma.reaction.upsert({
            where: { userId_postId: key },
            create: key,
            update: {},
          });
        else await prisma.reaction.deleteMany({ where: key });
      }
      return NextResponse.json({
        enabled: input.enabled,
        count: await prisma.reaction.count({ where: { postId } }),
        message:
          action === "bookmark" ? "Bookmarks updated." : "Reaction updated.",
      });
    }

    if (action === "follow") {
      const followingId = recordId(input.memberId);
      if (followingId === member.id || typeof input.enabled !== "boolean")
        throw new InputError("Invalid follow selection.");
      const target = await prisma.user.findFirst({
        where: { id: followingId, isAuthor: true },
        select: { id: true },
      });
      if (!target) throw new InputError("This contributor is unavailable.");
      const key = { followerId: member.id, followingId };
      if (input.enabled)
        await prisma.follow.upsert({
          where: { followerId_followingId: key },
          create: key,
          update: {},
        });
      else await prisma.follow.deleteMany({ where: key });
      return NextResponse.json({
        enabled: input.enabled,
        message: "Following updated.",
      });
    }

    if (action === "comment") {
      const postId = recordId(input.postId);
      const body = text(input.body, "Comment", 1, 2000);
      if (
        !(await prisma.post.findFirst({
          where: { id: postId, published: true },
          select: { id: true },
        }))
      )
        throw new InputError("This post is unavailable.");
      const comment = await prisma.comment.create({
        data: { postId, userId: member.id, body },
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      });
      return NextResponse.json({ comment, message: "Your comment was added." });
    }

    if (action === "vote") {
      const optionId = recordId(input.optionId);
      const option = await prisma.pollOption.findFirst({
        where: { id: optionId, poll: { active: true } },
        select: { pollId: true },
      });
      if (!option) throw new InputError("This poll is closed.");
      await prisma.vote.upsert({
        where: { userId_pollId: { userId: member.id, pollId: option.pollId } },
        create: { userId: member.id, pollId: option.pollId, optionId },
        update: {},
      });
      return NextResponse.json({ message: "Your vote has been recorded." });
    }

    if (action === "submit") {
      const title = text(input.title, "Title", 5, 255);
      const body = text(input.body, "Article", 50, 50000);
      if (!categories.includes(input.category))
        throw new InputError("Choose a valid category.");
      await prisma.submission.create({
        data: { title, body, category: input.category, authorId: member.id },
      });
      return NextResponse.json({
        message: "Your article has been submitted for editorial review.",
      });
    }

    if (action === "profile") {
      const name = text(input.name, "Name", 2, 100);
      const bio =
        typeof input.bio === "string" ? input.bio.trim().slice(0, 500) : "";
      const specialty =
        typeof input.specialty === "string"
          ? input.specialty.trim().slice(0, 150)
          : "";
      const updated = await prisma.user.update({
        where: { id: member.id },
        data: { name, bio, specialty },
        select: publicMember,
      });
      return NextResponse.json({
        member: updated,
        message: "Your profile has been updated.",
      });
    }
    throw new InputError("Unknown action.");
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof Error && error.message.startsWith("Too many"))
      return NextResponse.json({ error: error.message }, { status: 429 });
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    )
      return NextResponse.json(
        { error: "This email is already registered. Please sign in." },
        { status: 409 },
      );
    console.error("Community action failed", error);
    return NextResponse.json(
      { error: "We couldn’t complete your request. Please try again." },
      { status: 503 },
    );
  }
}
