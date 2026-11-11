
"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer bg-[#111827] flex items-center justify-center h-16 text-white">
      <p>
        © {year ?? "2026"} My Website. All rights reserved. 
      </p>
    
      <div className="footer-links">
        <a href="/privacy-policy">Privacy Policy </a>
        <a href="/terms">Terms & Conditions</a>
      </div>
    </footer>
  );
}
