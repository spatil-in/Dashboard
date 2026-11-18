import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";
import { postInclude, serializePost } from "@/lib/community/data";
import { formatDate } from "@/lib/community/types";
import MediaSkeleton from "@/components/community/MediaSkeleton";
import ArticleInteractions from "@/components/community/ArticleInteractions";

async function Article({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const member = await getCurrentMember();
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
    include: {
      ...postInclude(member?.id),
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  if (!post) notFound();
  return (
    <article className="article-detail">
      <Link href="/" className="back-link">
        ← Back to the community
      </Link>
      <div className="post-category">
        <Link href={`/?category=${encodeURIComponent(post.category)}`}>
          / {post.category}
        </Link>
      </div>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <time dateTime={post.publishedAt.toISOString()}>
          {formatDate(post.publishedAt.toISOString())}
        </time>
        <span>|</span>
        <Link href={`/members/${post.author.id}`} className="author-link">
          {post.author.name}
        </Link>
      </div>
      <MediaSkeleton src={post.imageUrl} alt={post.title} />
      {post.mediaUrl &&
        /^https:\/\//.test(post.mediaUrl) &&
        (post.category === "Podcasts" ? (
          <audio src={post.mediaUrl} controls preload="metadata" />
        ) : (
          <video
            src={post.mediaUrl}
            controls
            preload="metadata"
            style={{ width: "100%" }}
          />
        ))}
      <div className="article-body">{post.body}</div>
      {post.eventDate && (
        <div className="article-actions">
          <span>{formatDate(post.eventDate.toISOString())}</span>
          <span>{post.location}</span>
        </div>
      )}
      <ArticleInteractions
        key={`${post.id}-${member?.id}`}
        post={serializePost(post)}
        initialComments={post.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
        }))}
      />
    </article>
  );
}

export default function ArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="simple-page" role="status">
          Loading story…
        </div>
      }
    >
      <Article {...props} />
    </Suspense>
  );
}
