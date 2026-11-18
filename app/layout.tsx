import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentMember } from "@/lib/auth";
import CommunityProvider from "@/components/community/CommunityProvider";
import PageShell from "@/components/community/PageShell";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Frontline Code — Home", template: "%s | Frontline Code" },
  description:
    "News, ideas, and conversations for the developer community. Write to think. Publish to connect.",
};

async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  return (
    <CommunityProvider initialMember={member}>
      <PageShell>{children}</PageShell>
    </CommunityProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              Loading Frontline Code…
            </div>
          }
        >
          <CommunityLayout>{children}</CommunityLayout>
        </Suspense>
      </body>
    </html>
  );
}
