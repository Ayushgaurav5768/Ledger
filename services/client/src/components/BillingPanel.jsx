import { useState, useEffect } from "react";
import { getBilling } from "../services/api";

export default function BillingPanel({ apiKey, onTierChange }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetch() {
      try {
        const d = await getBilling(apiKey);
        if (active) {
          setData(d);
          if (onTierChange) onTierChange(d.tier);
        }
      } catch {
        // ignore
      }
    }
    fetch();
    const id = setInterval(fetch, 5000);
    return () => { active = false; clearInterval(id); };
  }, [apiKey, onTierChange]);

  if (!data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading billing data...</p>
      </div>
    );
  }

  const freeRequests = 1000;
  const usagePercent = Math.min((data.usageCount / freeRequests) * 100, 100);
  const isFreeTier = data.tier === "free";
  const isOverFree = data.usageCount > freeRequests;

  let progressColor = "green";
  if (usagePercent > 80) progressColor = "amber";
  if (usagePercent > 95) progressColor = "rose";

  return (
    <div className="slide-up">
      <div>
        <div className="card-title" style={{ marginBottom: 4 }}>Billing Overview</div>
        <div className="card-subtitle" style={{ marginBottom: 20 }}>Real-time usage and cost tracking</div>
      </div>

      <div className="billing-cards">
        <div className="stat-card">
          <div className="stat-icon accent">&#9766;</div>
          <div className="stat-label">Tier</div>
          <div className="stat-value" style={{ fontSize: 24, marginBottom: 8 }}>
            {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}
          </div>
          <span className={`tier-badge ${data.tier}`}>{data.tier}</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">&#9776;</div>
          <div className="stat-label">Total Requests</div>
          <div className="stat-value cyan">{data.usageCount.toLocaleString()}</div>

          {isFreeTier && (
            <div className="progress-container">
              <div className="progress-header">
                <span>{data.usageCount.toLocaleString()} / {freeRequests.toLocaleString()} free</span>
                <span>{usagePercent.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${progressColor}`} style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">&#9733;</div>
          <div className="stat-label">Amount Due</div>
          <div className="stat-value amber">
            {data.amountDue > 0 ? `$${data.amountDue.toFixed(2)}` : "$0.00"}
          </div>
          {isOverFree && isFreeTier && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              Over free tier limit
            </p>
          )}
          {!isFreeTier && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              Rate: $0.001 / request (after {freeRequests.toLocaleString()} free)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
