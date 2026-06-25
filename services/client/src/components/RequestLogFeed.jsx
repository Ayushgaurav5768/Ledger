export default function RequestLogFeed() {
  return (
    <div className="stat-card">
      <div className="stat-label">Request Logs</div>
      <div className="empty-state" style={{ padding: "24px 12px" }}>
        <div className="empty-state-icon">&#9776;</div>
        <div className="empty-state-title">Coming Soon</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Real-time request log streaming will appear here.
        </p>
      </div>
    </div>
  );
}
