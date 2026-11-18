import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 2,
  }),
});

async function seed() {
  // These are reference-design records, kept in the database so the UI has no hardcoded feed.
  const contributors = [
    {
      name: "Tanya K.",
      email: "tanya@frontline.example",
      specialty: "Distributed systems",
      bio: "Writing about distributed systems and the engineering decisions behind them.",
    },
    {
      name: "Marco J.",
      email: "marco@frontline.example",
      specialty: "Rust · WebAssembly",
      bio: "Exploring Rust, WebAssembly, and the future of the web.",
    },
    {
      name: "Priya L.",
      email: "priya@frontline.example",
      specialty: "DevOps · Platform Eng.",
      bio: "Sharing ideas about developer platforms and reliable infrastructure.",
    },
    {
      name: "Ryan Cooghlan",
      email: "ryan@frontline.example",
      specialty: "Developer tools",
      bio: "Covering developer tools, technology news, and the people building what comes next.",
    },
  ];
  const authors = [];
  for (const contributor of contributors) {
    authors.push(
      await prisma.user.upsert({
        where: { email: contributor.email },
        create: { ...contributor, isAuthor: true },
        update: {},
      }),
    );
  }
  const authorId = authors[3].id;
  const title =
    "GitHub Expands Copilot with Smarter Pull up Request Reviews and Code Suggestions";
  const excerpt =
    "GitHub is expanding the capabilities of GitHub Copilot, introducing intelligent pull request (PR) reviews and enhanced code suggestions designed to help developers ship software with better maintainability and code quality.";
  const records = [
    { slug: "github-copilot-smarter-reviews", title, category: "News" },
    {
      slug: "java-dashboard-code-suggestions",
      title:
        "Java dashboard Expands Copilot with Smarter Pull up Request Reviews and Code Suggestions",
      category: "News",
    },
    { slug: "building-with-copilot", title, category: "Blogs" },
    {
      slug: "community-sponsor",
      title: "Community partner spotlight",
      category: "Sponsored",
    },
    {
      slug: "push-to-prod-hackathon",
      title: "Push to Prod Hackathon: Building at the Frontier",
      category: "Hackathons",
      excerpt:
        "Build, collaborate, and bring your next idea to production with the developer community.",
      eventDate: new Date("2026-12-28T15:00:00Z"),
      location: "Online",
    },
    { slug: "better-code-reviews", title, category: "Blogs" },
    {
      slug: "developer-sponsor",
      title: "Developer partner spotlight",
      category: "Sponsored",
    },
    { slug: "copilot-code-quality-whitepaper", title, category: "Whitepapers" },
    { slug: "developer-tooling-update", title, category: "News" },
    {
      slug: "ai-junior-developers",
      title: "Is AI Replacing Junior Developers or Changing Their Role?",
      category: "Forum",
      excerpt:
        "Artificial intelligence has become a daily part of software development. From generating code and writing tests to debugging and documentation, tools like GitHub Copilot, Claude, Gemini, and Cursor are changing how developers work.",
    },
    {
      slug: "full-stack-development-2026",
      title:
        "Full-Stack Development Remains the Most In-Demand Coding Skill in 2026",
      category: "Videos",
    },
    { slug: "github-copilot-team-workflows", title, category: "News" },
    {
      slug: "women-in-ai-conversation",
      title: "Women in AI: In Conversation",
      category: "Events & Meetups",
      excerpt:
        "Join us for an intimate, invite-only afternoon bringing together women building, investing in, and shaping the future of AI.",
      eventDate: new Date("2026-12-09T11:00:00Z"),
      location: "Pune, India",
    },
    { slug: "github-code-suggestions-news", title, category: "News" },
    {
      slug: "full-stack-career-guide",
      title:
        "Full-Stack Development Remains the Most In-Demand Coding Skill in 2026",
      category: "Videos",
    },
    {
      slug: "full-stack-skills",
      title:
        "Full-Stack Development Remains the Most In-Demand Coding Skill in 2026",
      category: "Videos",
    },
    {
      slug: "rust-vs-go-backend",
      title: "Rust vs Go: which to pick for backend in 2025?",
      category: "Blogs",
      readCount: 3200,
    },
    {
      slug: "claude-opus-api",
      title: "Claude Opus 4.8 API — what changed for developers",
      category: "News",
      readCount: 2700,
    },
    {
      slug: "k8s-cost-optimisation",
      title: "k8s cost optimisation: spot instances in prod",
      category: "Blogs",
      readCount: 1900,
    },
    {
      slug: "cursor-vs-copilot",
      title: "Cursor vs Copilot — a 6-month honest review",
      category: "Blogs",
      readCount: 1400,
    },
    {
      slug: "frontline-live-ai-production",
      title: "Frontline Live: AI in Production",
      category: "Events & Meetups",
      eventDate: new Date("2026-11-28T15:00:00Z"),
      location: "Online · Free · 3pm UTC",
    },
    {
      slug: "pune-dev-meetup-12",
      title: "Pune Dev Meetup #12",
      category: "Events & Meetups",
      eventDate: new Date("2026-12-05T10:00:00Z"),
      location: "Pune · In-person",
    },
    {
      slug: "open-source-sprint",
      title: "Open-source sprint weekend",
      category: "Events & Meetups",
      eventDate: new Date("2026-12-14T09:00:00Z"),
      location: "Online · Free",
    },
  ];
  for (const [index, record] of records.entries()) {
    await prisma.post.upsert({
      where: { slug: record.slug },
      create: {
        excerpt,
        body: `${record.excerpt || excerpt}\n\nThis reference story is part of the initial Frontline Code content collection. Replace its body and media through your content database to publish the complete article.`,
        tags: ["javascript", "webdev", "reactjs", "code"],
        authorId,
        publishedAt: new Date("2026-01-07T09:00:00Z"),
        sortOrder: index,
        ...record,
      },
      update: {},
    });
  }
  const videoTitles = [
    "Building a Local-First App with CRDTs",
    "Live Coding: Refactoring a Legacy React App",
    "AI Pair Programming: Conference Keynote",
    "Designing APIs Developers Actually Love",
    "Kubernetes in 15 Minutes",
    "Interview: Building Rust at Scale",
    "From Figma to Production: A Design Systems Talk",
    "Debugging Memory Leaks in Node.js",
    "Hackathon Highlights: Push to Prod 2026",
    "From Figma to Production: A Design Systems Talk",
    "Debugging Memory Leaks in Node.js",
    "Hackathon Highlights: Push to Prod 2026",
  ];
  for (const category of ["Blogs", "Whitepapers", "Videos"]) {
    const count = category === "Blogs" ? 9 : 13;
    for (let i = 0; i < count; i++) {
      const slug = "reference-" + category.toLowerCase() + "-" + i;
      await prisma.post.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          category,
          authorId,
          title:
            i === 0 && category !== "Videos"
              ? "AI-Powered Coding Tools Transform the Way Developers Build Software"
              : category === "Videos"
                ? videoTitles[i % videoTitles.length]
                : title,
          excerpt,
          body: excerpt,
          tags:
            category === "Videos"
              ? [
                  ["Tutorials"],
                  ["Tutorials"],
                  ["Conference Talks"],
                  ["Product Demos"],
                  ["Tutorials"],
                  ["Interviews"],
                  ["Conference Talks"],
                  ["Tutorials"],
                  ["Webinars"],
                ][i % 9]
              : ["webdev", "machinelearning", "javascript", "ai", "frontend"],
          company: category === "Whitepapers" ? "Freshworks" : null,
          sortOrder: 100 + count - i,
          publishedAt: new Date("2026-01-07T09:00:00Z"),
        },
      });
    }
  }
  const discussion = await prisma.post.findUnique({
    where: { slug: "ai-junior-developers" },
  });
  if (
    discussion &&
    !(await prisma.comment.findFirst({ where: { postId: discussion.id } }))
  ) {
    const commenter = await prisma.user.upsert({
      where: { email: "deborah@frontline.example" },
      create: { name: "Deborah Kohler", email: "deborah@frontline.example" },
      update: {},
    });
    await prisma.comment.create({
      data: {
        postId: discussion.id,
        userId: commenter.id,
        body: "This looks really cool! If you tell me what the GitHub topic/project is about, I can say that sounds much more natural and relevant rather than generic.",
      },
    });
  }
  if (!(await prisma.poll.findFirst()))
    await prisma.poll.create({
      data: {
        question: "What tech will have the biggest impact in 2026",
        options: {
          create: [
            "AI Agents",
            "Edge Computing",
            "WebAssembly",
            "Quantum Computing",
          ].map((label) => ({ label })),
        },
      },
    });
  console.log("Reference content seeded. Existing records were preserved.");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
