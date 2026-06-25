import { useState, useEffect } from "react";

export default function RateLimitStatus({ apiKey }) {
  const [status, setStatus] = useState("idle");
  const [responseTime, setResponseTime] = useState(null);

  async function testRateLimit() {
    setStatus("testing");
    const start = performance.now();
    try {
      const res = await fetch("/api/test", {
        headers: { "x-api-key": apiKey },
      });
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      setResponseTime(elapsed);
      if (res.status === 429) {
        setStatus("limited");
      } else {
        setStatus("ok");
      }
    } catch {
      setStatus("error");
    }
  }

  const statusColors = {
    idle: "var(--text-muted)",
    testing: "var(--cyan)",
    ok: "var(--green)",
    limited: "var(--amber)",
    error: "var(--rose)",
  };

  const statusLabels = {
    idle: "Not tested",
    testing: "Testing...",
    ok: "Request allowed",
    limited: "Rate limited",
    error: "Error",
  };

  return (
    <div className="stat-card" style={{ cursor: "pointer" }} onClick={testRateLimit}>
      <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--amber)" }}>
        &#9889;
      </div>
      <div className="stat-label">Rate Limit Test</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: statusColors[status], display: "inline-block" }} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{statusLabels[status]}</span>
      </div>
      {responseTime && (
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Response: {responseTime}s
        </p>
      )}
      {status === "idle" && (
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Click to test</p>
      )}
    </div>
  );
}
