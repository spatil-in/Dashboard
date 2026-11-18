import { Suspense } from "react";
import { WriteForm } from "@/components/community/MemberForms";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Write for us" };

async function Submissions() {
  const member = await getCurrentMember();
  if (!member) return null;
  const submissions = await prisma.submission.findMany({
    where: { authorId: member.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, title: true, status: true },
  });
  if (!submissions.length) return null;
  return (
    <section className="submission-list">
      <h2>Your submissions</h2>
      {submissions.map((submission) => (
        <article key={submission.id}>
          <strong>{submission.title}</strong>
          <span>
            {submission.status === "pending"
              ? "In editorial review"
              : submission.status}
          </span>
        </article>
      ))}
    </section>
  );
}

export default function WritePage() {
  return (
    <section className="simple-page">
      <span className="dialog-eyebrow">WRITE FOR FRONTLINE CODE</span>
      <h1>Write to think. Publish to connect.</h1>
      <p>
        Share technical tutorials, opinion pieces, and deep dives with the
        developer community. Submit your article for editorial review.
      </p>
      <WriteForm />
      <Suspense>
        <Submissions />
      </Suspense>
    </section>
  );
}
