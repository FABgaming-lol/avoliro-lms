import React, { useState } from "react";

/* 
   Add each employee's unique access key here.
   You can revoke access by simply deleting a key.
*/
const VALID_KEYS = [
  "AVO-EMP-001-YUVI",
  "AVO-EMP-002-SRISHTI",
  "AVO-EMP-003-PRIYA",
  "AVO-EMP-004-SURAJ",
  "AVO-EMP-005-ANITA"
];

export default function AuthGate({ children }) {
  const [allowed, setAllowed] = useState(() => {
    return localStorage.getItem("avoliro_auth") === "granted";
  });

  const [code, setCode] = useState("");

  function unlock() {
    const input = code.trim().toUpperCase();

    if (VALID_KEYS.includes(input)) {
      localStorage.setItem("avoliro_auth", "granted");
      localStorage.setItem("avoliro_key_used", input); // optional tracking
      setAllowed(true);
    } else {
      alert("Incorrect access code.");
    }
  }

  if (allowed) return children;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #0b1020, #061222)",
        color: "white",
        flexDirection: "column",
        padding: 20,
        textAlign: "center"
      }}
    >
      <img
        src="/logo.png"
        alt="AVOLIRO"
        style={{ width: 80, marginBottom: 20 }}
      />

      <h2 style={{ marginBottom: 10, fontWeight: 900 }}>
        🔒 AVOLIRO STAFF ACCESS
      </h2>
      <p style={{ opacity: 0.6, marginBottom: 20 }}>
        Enter your personal access key to continue.
      </p>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your access key"
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          width: 260,
          textAlign: "center",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white",
          marginBottom: 12
        }}
      />

      <button
        onClick={unlock}
        className="btn btn-gold"
        style={{ width: 260 }}
      >
        Unlock
      </button>

      <p style={{ marginTop: 20, opacity: 0.4, fontSize: 12 }}>
        Authorized employees only.
      </p>
    </div>
  );
}