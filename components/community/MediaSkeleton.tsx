import Image from "next/image";

export default function MediaSkeleton({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src && (src.startsWith("/") || /^https:\/\//.test(src))) {
    return (
      <div className={`post-media ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 800px) 100vw, 60vw"
        />
      </div>
    );
  }
  return (
    <div
      className={`post-media media-skeleton ${className}`}
      role="img"
      aria-label={`${alt} — image placeholder`}
    >
      <span className="sr-only">Image will appear when available.</span>
    </div>
  );
}
