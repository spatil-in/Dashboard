"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="simple-page empty-state">
      <h1>We couldn’t load the community.</h1>
      <p>Please check the database connection and try again.</p>
      <button className="button green" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
