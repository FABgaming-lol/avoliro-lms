import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthGate from "./AuthGate";
import "./styles.css";
import "./a11y.css";

createRoot(document.getElementById("root")).render(
  <AuthGate>
    <App />
  </AuthGate>
);