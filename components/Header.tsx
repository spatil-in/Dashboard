
import Link from "next/link";

export default function Header() {
  return (
    <header className="header bg-[#111827] px-3 py-2 text-white">
      <nav>
        <ul className="flex justify-between items-center">
         <li>
            <Link href="/" className="flex items-center gap-1">
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/about" className="flex items-center gap-1">
              <span>About</span>
            </Link>
          </li>
          <li>
            <Link href="/product" className="flex items-center gap-1">
              <span>Product</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
