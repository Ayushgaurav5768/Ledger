import { useState } from "react";
import { registerApiKey } from "../services/api";

export default function ApiKeyRegistration({ onRegistered }) {
  const [backendUrl, setBackendUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const k = await registerApiKey(backendUrl);
      setKey(k);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (key) {
    const curlCmd = `curl https://ce1c259a631f7a.lhr.life/api/test -H "x-api-key: ${key}"`;
    return (
      <div className="slide-up" style={{ maxWidth: 640, margin: "60px auto" }}>
        <div className="card card-accent">
          <div className="success-state">
            <div className="success-icon">&#10003;</div>
            <div className="success-title">API Key Generated</div>
            <div className="success-text">Your key is ready to use. Copy it and start making requests.</div>
          </div>

          <div className="divider" />

          <div className="form-group">
            <label className="form-label">Your API Key</label>
            <div className="key-display">
              <input className="form-input readonly key-input" readOnly value={key} />
              <button
                className="copy-btn"
                onClick={(e) => {
                  navigator.clipboard.writeText(key);
                  e.currentTarget.textContent = "Copied!";
                  e.currentTarget.classList.add("copied");
                  setTimeout(() => {
                    e.currentTarget.textContent = "Copy";
                    e.currentTarget.classList.remove("copied");
                  }, 2000);
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Test with curl</label>
            <div className="code-block">
              <span className="comment"># Try it out:</span>{'\n'}
              <span className="highlight">curl</span> https://ce1c259a631f7a.lhr.life/api/test \<span className="highlight">{'\n  '}-H</span> "x-api-key: {key}"
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onRegistered(key)}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-up" style={{ maxWidth: 520, margin: "80px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>
          Get Started
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Register an API key to access the Ledger gateway
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Backend URL</label>
            <input
              className="form-input"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://fake-backend:5001"
            />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              The URL your requests will be proxied to
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--rose)",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading || !backendUrl}>
            {loading ? <><span className="spinner" /> Registering...</> : "Generate API Key"}
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Registered keys are stored securely and rate-limited per tier
        </p>
      </div>
    </div>
  );
}
