import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { initials } from "@/lib/community/types";

export const metadata = { title: "Community contributors" };

async function Members() {
  await connection();
  const members = await prisma.user.findMany({
    where: { isAuthor: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, specialty: true },
    take: 100,
  });
  return (
    <div className="member-list">
      {members.map((member) => (
        <Link
          href={`/members/${member.id}`}
          className="member-card"
          key={member.id}
        >
          <span className="member-avatar">{initials(member.name)}</span>
          <div>
            <h2>{member.name}</h2>
            <p>{member.specialty}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function MembersPage() {
  return (
    <section className="simple-page">
      <span className="dialog-eyebrow">MEET THE COMMUNITY</span>
      <h1>People behind the ideas.</h1>
      <p>
        Discover the contributors sharing their expertise on Frontline Code.
      </p>
      <Suspense fallback={<p role="status">Loading contributors…</p>}>
        <Members />
      </Suspense>
    </section>
  );
}
