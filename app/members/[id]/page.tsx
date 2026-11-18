import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { initials } from "@/lib/community/types";

async function Contributor({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const member = await prisma.user.findFirst({
    where: { id: Number(id), isAuthor: true },
    select: {
      name: true,
      specialty: true,
      bio: true,
      posts: {
        where: { published: true, category: { not: "Sponsored" } },
        orderBy: { publishedAt: "desc" },
        take: 30,
        select: { slug: true, title: true, category: true },
      },
    },
  });
  if (!member) notFound();
  return (
    <section className="simple-page">
      <Link className="back-link" href="/members">
        ← All contributors
      </Link>
      <div className="profile-heading">
        <span className="member-avatar">{initials(member.name)}</span>
        <div>
          <h1>{member.name}</h1>
          <p>{member.specialty}</p>
        </div>
      </div>
      <p>{member.bio}</p>
      <section className="member-list">
        {member.posts.map((post) => (
          <Link
            className="member-card"
            href={`/posts/${post.slug}`}
            key={post.slug}
          >
            <div>
              <p>{post.category}</p>
              <h2>{post.title}</h2>
            </div>
          </Link>
        ))}
      </section>
    </section>
  );
}

export default function ContributorPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="simple-page">Loading contributor…</div>}
    >
      <Contributor {...props} />
    </Suspense>
  );
}
