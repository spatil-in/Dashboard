import Link from "next/link";

export default function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={`frontline-brand ${footer ? "footer-brand" : ""}`}
      aria-label="Frontline Code home"
    >
      Front<span className="brand-slash">/</span>ine{" "}
      <span className="brand-code">&lt;ode</span>
    </Link>
  );
}
