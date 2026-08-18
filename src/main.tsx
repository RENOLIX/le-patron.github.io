import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const RECOVERY_STORAGE_KEY = "__mina_supabase_recovery_payload";

function getRecoveryPayloadFromLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const rawSearch = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;

  const hashPayload =
    rawHash.startsWith("access_token=") ||
    rawHash.includes("&access_token=") ||
    rawHash.startsWith("type=") ||
    rawHash.startsWith("error=")
      ? rawHash
      : null;
  const routePayload = rawHash.startsWith("/admin/reset-password?")
    ? rawHash.split("?")[1] ?? null
    : null;
  const candidates = [hashPayload, routePayload, rawSearch].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const params = new URLSearchParams(candidate);
    const hasRecoveryToken =
      params.has("access_token") ||
      params.has("refresh_token") ||
      params.has("token_hash") ||
      params.has("code");
    const isRecovery =
      params.get("type") === "recovery" ||
      (hasRecoveryToken && candidate.toLowerCase().includes("recovery"));
    const hasError = params.has("error") || params.has("error_code");

    if (isRecovery || hasError) {
      return candidate;
    }
  }

  return null;
}

if (typeof window !== "undefined") {
  const recoveryPayload = getRecoveryPayloadFromLocation();

  if (recoveryPayload) {
    const params = new URLSearchParams(recoveryPayload);
    const nextHash =
      params.get("type") === "recovery" ||
      params.has("access_token") ||
      params.has("token_hash") ||
      params.has("code")
        ? "#/admin/reset-password"
        : "#/admin/login";

    window.sessionStorage.setItem(RECOVERY_STORAGE_KEY, recoveryPayload);

    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}${nextHash}`,
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
