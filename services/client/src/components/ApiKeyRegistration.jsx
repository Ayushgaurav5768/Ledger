import { useState } from "react";
import { registerApiKey } from "../services/api";

export default function ApiKeyRegistration({ onRegistered }) {
  const [backendUrl, setBackendUrl] = useState("");
  const [key, setKey] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const k = await registerApiKey(backendUrl);
      setKey(k);
      onRegistered(k);
    } finally {
      setLoading(false);
    }
  }

  if (key) {
    return (
      <div>
        <h2>API Key Registered</h2>
        <p><strong>Your API key:</strong></p>
        <input
          readOnly
          value={key}
          style={{ width: "100%", fontFamily: "monospace", padding: 8 }}
        />
        <p><strong>Test with curl:</strong></p>
        <pre style={{ background: "#eee", padding: 8 }}>
          curl http://localhost:8080/api/test -H "x-api-key: {key}"
        </pre>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register API Key</h2>
      <p>
        <label>
          Backend URL:<br />
          <input
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://fake-backend:5001"
            style={{ width: 300, padding: 4 }}
          />
        </label>
      </p>
      <button disabled={loading || !backendUrl}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}

