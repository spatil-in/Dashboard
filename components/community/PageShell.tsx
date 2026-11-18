"use client";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import Footer from "../Footer";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const auth = ["/signin", "/signup", "/topics"].includes(path);
  const compact = ["/blogs", "/whitepapers"].includes(path);
  if (auth)
    return (
      <div className="auth-shell">
        <div className="auth-top" />
        <main id="main-content">{children}</main>
      </div>
    );
  return (
    <>
      <Header />
      <div className={`site-layout ${compact ? "compact-layout" : ""}`}>
        <Suspense>
          <Sidebar />
        </Suspense>
        <main id="main-content">{children}</main>
      </div>
      <Footer />
    </>
  );
}
