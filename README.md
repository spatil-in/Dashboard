This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Community database and components

The home page follows the supplied Frontline Code home frame. Images use placeholders until a post has an `imageUrl`. Feed content and discovery widgets read from MySQL through Prisma.

Configure `DATABASE_URL` for Prisma migrations, plus `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, and `DATABASE_NAME` for the runtime adapter in your local `.env`.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The seed adds reference-design content and preserves existing records. Contributor records have no login password. Use Create account in the Sign in dialog to make a member account.

- `components/community` contains the reusable feed, post card, media placeholder, discovery widgets, newsletter form, and member forms.
- `lib/community/types.ts` defines the data passed to components.
- `lib/community/data.ts` contains the Prisma queries and serialization. Connect a different backend here while keeping the same component data shapes.
- `app/api/community/route.ts` handles authentication, subscriptions, bookmarks, reactions, follows, comments, votes, profiles, and editorial submissions. Mutations verify the request origin and authenticated member where required.
- `lib/auth.ts` manages salted password hashes and database sessions. Cookies are HTTP-only, use SameSite Lax, and expire after seven days.
- `prisma/schema.prisma` defines the content and member models. Set `Post.imageUrl` to a local asset path or HTTPS URL, and `Post.mediaUrl` to an HTTPS audio or video source.

Newsletter subscriptions are saved in the `Subscription` table. Email delivery needs a mail provider integration in the subscribe action. Editorial submissions are saved for review in `Submission`. Further signed-in screens can reuse the existing member context and API when their Figma frames are supplied.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
