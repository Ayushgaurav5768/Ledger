import { useState } from "react";
import ApiKeyRegistration from "./components/ApiKeyRegistration";
import BillingPanel from "./components/BillingPanel";

export default function App() {
  const [apiKey, setApiKey] = useState(null);

  if (!apiKey) return <ApiKeyRegistration onRegistered={setApiKey} />;

  return (
    <div>
      <h1>Ledger Dashboard</h1>
      <p>API Key: <code>{apiKey}</code></p>
      <BillingPanel apiKey={apiKey} />
      <p><button onClick={() => setApiKey(null)}>Register a different key</button></p>
    </div>
  );
}

