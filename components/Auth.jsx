import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    await supabase.auth.signUp({
      email,
      password
    });

    alert("Check your email to confirm signup.");
  };

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password
    });

    window.location.reload();
  };

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      padding: "40px"
    }}>
      <h1>Login / Signup</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={signIn}>
        Login
      </button>

      <button onClick={signUp}>
        Create Account
      </button>
    </div>
  );
}
