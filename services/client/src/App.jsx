import { useState } from "react";
import ApiKeyRegistration from "./components/ApiKeyRegistration";
import BillingPanel from "./components/BillingPanel";

export default function App() {
  const [apiKey, setApiKey] = useState(null);
  const [apiKeyTier, setApiKeyTier] = useState(null);

  if (!apiKey) {
    return (
      <div className="app-container">
        <div className="bg-glow" />
        <header className="app-header">
          <div className="app-header-left">
            <div className="app-logo">L</div>
            <span className="app-title">Ledger</span>
          </div>
          <div className="app-header-right">
            <div className="status-badge">
              <span className="status-dot" />
              All Systems Online
            </div>
          </div>
        </header>
        <main className="app-main">
          <ApiKeyRegistration
            onRegistered={(key, tier) => {
              setApiKey(key);
              setApiKeyTier(tier);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-glow" />
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">L</div>
          <span className="app-title">Ledger</span>
        </div>
        <div className="app-header-right">
          <div className="status-badge">
            <span className="status-dot" />
            All Systems Online
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setApiKey(null); setApiKeyTier(null); }}>
            New Key
          </button>
        </div>
      </header>
      <main className="app-main">
        <div className="slide-up" style={{ marginBottom: 24 }}>
          <div className="card card-accent">
            <div className="card-header">
              <div>
                <div className="card-title">Active API Key</div>
                <div className="card-subtitle">This key is being used for billing and requests</div>
              </div>
              <span className={`tier-badge ${apiKeyTier || 'free'}`}>{apiKeyTier || 'free'}</span>
            </div>
            <div className="key-display">
              <input className="form-input readonly key-input" readOnly value={apiKey} />
              <button
                className="copy-btn"
                onClick={(e) => {
                  navigator.clipboard.writeText(apiKey);
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
        </div>
        <BillingPanel apiKey={apiKey} onTierChange={setApiKeyTier} />
      </main>
    </div>
  );
}
