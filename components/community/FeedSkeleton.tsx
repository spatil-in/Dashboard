export default function FeedSkeleton() {
  return (
    <div
      className="home-columns"
      role="status"
      aria-label="Loading community stories"
    >
      <section className="feed-column">
        <div className="skeleton-prompt" />
        {[0, 1, 2].map((item) => (
          <div className="post-card loading-post" key={item}>
            <div className="skeleton-line short" />
            <div className="post-media media-skeleton" />
            <div className="post-content">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </section>
      <aside className="discovery-rail">
        <div className="ad-space">Ad space</div>
        <div className="rail-widget skeleton-widget" />
        <div className="rail-widget skeleton-widget" />
      </aside>
    </div>
  );
}
