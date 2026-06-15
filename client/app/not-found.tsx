import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <p
          className="badge badge-accent"
          style={{ marginBottom: "20px", fontSize: "0.65rem" }}
        >
          404
        </p>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "28px",
          }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-primary"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            fontSize: "0.9rem",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
