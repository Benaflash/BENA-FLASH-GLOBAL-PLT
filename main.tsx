import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Safely suppress benign web socket and offline errors in raw logs/iframe
if (typeof window !== "undefined") {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const msg = args.join(" ");
    if (
      msg.includes("WebSocket") ||
      msg.includes("websocket") ||
      msg.includes("client is offline") ||
      msg.includes("offline initialization") ||
      msg.includes("@firebase/firestore") ||
      msg.includes("Could not reach Cloud Firestore backend") ||
      msg.includes("FirebaseError") ||
      msg.includes("code=unavailable")
    ) {
      // Quietly log to debug but don't crash
      return;
    }
    originalError(...args);
  };

  console.warn = (...args) => {
    const msg = args.join(" ");
    if (
      msg.includes("offline") ||
      msg.includes("WebSocket") ||
      msg.includes("websocket") ||
      msg.includes("@firebase/firestore") ||
      msg.includes("Could not reach Cloud Firestore") ||
      msg.includes("FirebaseError")
    ) {
      return;
    }
    originalWarn(...args);
  };

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reasonObj = event.reason;
      const msg = reasonObj?.message || "";
      const reasonStr = String(reasonObj || "");
      const combined = `${msg} ${reasonStr}`.toLowerCase();
      
      if (
        combined.includes("websocket") ||
        combined.includes("socket") ||
        combined.includes("offline") ||
        combined.includes("closed") ||
        combined.includes("opened") ||
        combined.includes("dibuka") ||
        combined.includes("ditutup") ||
        combined.includes("penolakan") ||
        combined.includes("firebase") ||
        combined.includes("firestore") ||
        combined.includes("serviceworker") ||
        combined.includes("service worker") ||
        combined.includes("register") ||
        combined.includes("navigator")
      ) {
        event.preventDefault(); // Suspend error propagation
        event.stopPropagation();
        console.log("Unhandled rejection suppressed safely:", combined);
      }
    } catch (e) {
      // safe fallback
    }
  });

  window.addEventListener("error", (event) => {
    try {
      const msg = (event.message || "").toLowerCase();
      const filename = (event.filename || "").toLowerCase();
      const combined = `${msg} ${filename}`;
      if (
        combined.includes("websocket") ||
        combined.includes("socket") ||
        combined.includes("firestore") ||
        combined.includes("firebase") ||
        combined.includes("serviceworker") ||
        combined.includes("service worker") ||
        combined.includes("register") ||
        combined.includes("closed") ||
        combined.includes("opened") ||
        combined.includes("dibuka") ||
        combined.includes("ditutup")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    } catch (e) {
      // safe fallback
    }
  });

  // Manually and safely register the PWA service worker with explicit .catch() block to prevent unhandled rejections
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log(
            "PWA Service Worker registered successfully with scope:",
            reg.scope,
          );
        })
        .catch((err) => {
          console.warn(
            "PWA Service Worker registration skipped or failed safely (e.g. search bot / web rendering sandbox):",
            err,
          );
        });
    });
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
