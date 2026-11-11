
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">

      <h1 className="text-8xl font-extrabold tracking-tight text-blue-600 md:text-9xl">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 md:text-base">
        Sorry, the page you are looking for doesn't exist
        or has been moved.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        <Home size={18} />
        Back to Home
      </Link>

    </div>
  );
}
