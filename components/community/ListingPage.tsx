import { Suspense } from "react";
import { connection } from "next/server";
import { getCurrentMember } from "@/lib/auth";
import { getFeed } from "@/lib/community/data";
import ContentListing from "./ContentListing";
async function Content({ category }: { category: string }) {
  await connection();
  const member = await getCurrentMember();
  const feed = await getFeed({ category, memberId: member?.id });
  return (
    <ContentListing
      key={`${category}-${member?.id}`}
      category={category}
      initial={feed}
    />
  );
}
export default function ListingPage({ category }: { category: string }) {
  return (
    <Suspense
      fallback={
        <div className="simple-page" role="status">
          Loading {category}…
        </div>
      }
    >
      <Content category={category} />
    </Suspense>
  );
}
