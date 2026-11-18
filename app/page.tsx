import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentMember } from "@/lib/auth";
import { getDiscovery, getFeed } from "@/lib/community/data";
import Feed from "@/components/community/Feed";
import DiscoveryRail from "@/components/community/DiscoveryRail";
import FeedSkeleton from "@/components/community/FeedSkeleton";

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category.slice(0, 50) : "";
  const query = typeof params.q === "string" ? params.q.slice(0, 150) : "";
  const listingRoutes: Record<string,string> = { Blogs:"/blogs",Whitepapers:"/whitepapers",Videos:"/videos" };
  if(listingRoutes[category]) redirect(listingRoutes[category]);
  const bookmarks = params.view === "bookmarks";
  const member = await getCurrentMember();
  const [feed, discovery] = await Promise.all([
    getFeed({
      category,
      query,
      bookmarks,
      memberId: member?.id,
      latest: params.sort === "latest",
    }),
    getDiscovery(member?.id),
  ]);
  return (
    <div className="home-columns">
      <Feed
        key={`${category}-${query}-${bookmarks}-${member?.id}-${params.sort}`}
        initial={feed}
        category={category}
        query={query}
        bookmarks={bookmarks}
      />
      <DiscoveryRail key={member?.id ?? "guest"} data={discovery} />
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
