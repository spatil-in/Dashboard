
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />

        <div className="main-layout flex min-h-screen gap-6">
          <Sidebar />

          <main className="main-content w-full p-3">
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
