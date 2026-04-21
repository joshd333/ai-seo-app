import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";

export default function App() {
  const [user, setUser] = useState(null);
  const [domain, setDomain] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    checkUser();
    loadHistory();
  }, []);

  const checkUser = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    setUser(user);
  };

  const loadHistory = async () => {
    const res = await fetch("/api/history");
    const json = await res.json();
    setHistory(json || []);
  };

  const analyze = async () => {
    if (!domain) return;

    const res = await fetch(`/api/analyze?domain=${domain}`);
    const json = await res.json();

    setData(json);
    loadHistory();
  };

  const subscribe = async (plan) => {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ plan })
    });

    const json = await res.json();

    if (json.url) {
      window.location.href = json.url;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      padding: "30px"
    }}>
      <h1>AI Visibility Platform</h1>

      <button onClick={logout}>
        Logout
      </button>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Enter domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />

        <button onClick={analyze}>
          Analyze
        </button>
      </div>

      {data && (
        <div style={{ marginTop: 30 }}>
          <h2>Visibility Score: {data.llm.visibility}%</h2>

          <h3>Top Competitors</h3>
          {data.competitors?.map((c, i) => (
            <p key={i}>• {c}</p>
          ))}

          <h3>Prompt Gaps</h3>
          {data.gaps?.map((g, i) => (
            <div key={i} style={{
              background: "#0f172a",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10
            }}>
              <strong>{g.prompt}</strong>
              <p>Competitors: {g.competitors.join(", ")}</p>
              <p>Priority: {g.priority}</p>
              <p>Opportunity Score: {g.opportunityScore}</p>
            </div>
          ))}

          <h2>Choose Your Plan</h2>

          <button onClick={() => subscribe("starter")}>
            Starter — $49/mo
          </button>

          <button onClick={() => subscribe("pro")}>
            Pro — $99/mo
          </button>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h3>Past Scans</h3>

        {history.map((h, i) => (
          <p key={i}>
            {h.domain} — {h.visibility}% —
            {new Date(h.created_at).toLocaleDateString()}
          </p>
        ))}
      </div>
    </div>
  );
}
