export default function UsageCounter({ usageCount }) {
  if (usageCount === undefined || usageCount === null) {
    return (
      <div className="stat-card">
        <div className="stat-icon cyan">&#9776;</div>
        <div className="stat-label">Requests</div>
        <div className="stat-value" style={{ fontSize: 14, color: "var(--text-muted)" }}>--</div>
      </div>
    );
  }

  const display = usageCount >= 1000
    ? (usageCount / 1000).toFixed(1) + "k"
    : usageCount.toString();

  return (
    <div className="stat-card">
      <div className="stat-icon cyan">&#9776;</div>
      <div className="stat-label">Total Requests</div>
      <div className="stat-value cyan">{display}</div>
    </div>
  );
}
