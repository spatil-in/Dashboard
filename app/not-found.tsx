import Link from "next/link";

export default function NotFound() {
  return (
    <div className="simple-page empty-state">
      <span className="dialog-eyebrow">404 / PAGE NOT FOUND</span>
      <h1>This story has moved on.</h1>
      <p>Explore the community to find your next great read.</p>
      <Link href="/" className="button green">
        Back to home
      </Link>
    </div>
  );
}
