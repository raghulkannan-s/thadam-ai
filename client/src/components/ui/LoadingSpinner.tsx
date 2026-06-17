"use client";

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ display: "inline-block" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minHeight: "60vh",
      }}
    >
      <div className="animate-fade-in" style={{ textAlign: "center" }}>
        <Spinner size={36} />
        <p
          style={{
            marginTop: "16px",
            color: "var(--text-tertiary)",
            fontSize: "0.875rem",
          }}
        >
          Loading…
        </p>
      </div>
    </div>
  );
}

export function AiLoader() {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-xl)",
          background: "var(--accent-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4c0 4 4 6 4 10" />
          <path d="M12 2a4 4 0 0 1 4 4c0 4-4 6-4 10" />
          <circle cx="12" cy="20" r="2" fill="var(--text-inverse)" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
          AI is crafting your roadmap…
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginTop: "4px" }}>
          This usually takes 10–20 seconds
        </p>
      </div>
      <div className="progress-bar" style={{ width: "200px" }}>
        <div
          className="progress-bar-fill"
          style={{ width: "60%" }}
        />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      className="panel"
      style={{
        borderRadius: "var(--radius-xl)",
        padding: "24px",
      }}
    >
      <div className="skeleton" style={{ height: "12px", width: "30%", marginBottom: "12px" }} />
      <div className="skeleton" style={{ height: "24px", width: "70%", marginBottom: "8px" }} />
      <div className="skeleton" style={{ height: "14px", width: "90%", marginBottom: "20px" }} />
      <div style={{ display: "flex", gap: "8px" }}>
        <div className="skeleton" style={{ height: "36px", width: "100px", borderRadius: "var(--radius-full)" }} />
        <div className="skeleton" style={{ height: "36px", width: "80px", borderRadius: "var(--radius-full)" }} />
      </div>
    </div>
  );
}
