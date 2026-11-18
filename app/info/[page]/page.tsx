import { notFound } from "next/navigation";
import Link from "next/link";

const pages = {
  about: {
    title: "About Frontline Code",
    intro: "A home for people building what comes next.",
    body: "Frontline Code brings technology news, developer perspectives, and community conversations together. Explore news and tutorials, discover events, and share what you’re learning.",
    link: "/write",
    label: "Write for us",
  },
  contact: {
    title: "Let’s connect.",
    intro: "Have an idea or a perspective to share?",
    body: "Our contributor form is the place to send technical tutorials, opinion pieces, and community stories to the editorial team. Sign in to submit your writing and track it from your account.",
    link: "/write",
    label: "Send an editorial submission",
  },
  privacy: {
    title: "Your privacy",
    intro: "Information used by this community application.",
    body: "Your name and email are stored when you create an account. Passwords are stored as salted hashes. An HTTP-only cookie keeps you signed in for up to seven days. Newsletter email addresses, saved posts, reactions, comments, follows, poll votes, and editorial submissions are stored in the project database. Comments and contributor profiles are displayed in the community. Newsletter signup records your subscription. The application does not currently send newsletter emails. Sign out from the account menu to end your session.",
    link: "/",
    label: "Back to home",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}

export default async function InformationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!(page in pages)) notFound();
  const content = pages[page as keyof typeof pages];
  return (
    <article className="simple-page">
      <span className="dialog-eyebrow">FRONTLINE CODE</span>
      <h1>{content.title}</h1>
      <p>{content.intro}</p>
      <p>{content.body}</p>
      <Link href={content.link} className="button outline">
        {content.label}
      </Link>
    </article>
  );
}
