import { useState, useEffect } from "react";
import { getBilling } from "../services/api";

export default function BillingPanel({ apiKey }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetch() {
      try {
        const d = await getBilling(apiKey);
        if (active) setData(d);
      } catch {
        // ignore
      }
    }
    fetch();
    const id = setInterval(fetch, 5000);
    return () => { active = false; clearInterval(id); };
  }, [apiKey]);

  if (!data) return <p>Loading billing...</p>;

  return (
    <div>
      <h2>Billing</h2>
      <p><strong>Tier:</strong> {data.tier}</p>
      <p><strong>Usage:</strong> {data.usageCount} requests</p>
      <p><strong>Amount due:</strong> ${data.amountDue.toFixed(2)}</p>
    </div>
  );
}

