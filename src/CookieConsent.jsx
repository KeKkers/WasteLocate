import { useState, useEffect } from "react";

// ─── CookieConsent Component ──────────────────────────────────────────────────
// Drop this into your App.jsx and render <CookieConsent /> near the top of your
// return statement (outside all routes so it appears on every page).
//
// Usage in App.jsx:
//   import CookieConsent from './CookieConsent';
//   ...
//   return (
//     <>
//       <CookieConsent />
//       {/* rest of your app */}
//     </>
//   );

const CONSENT_KEY = "wl-cookie-consent";

function loadConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveConsent(analytics, advertising) {
  const consent = { analytics, advertising, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  applyConsent(consent);
  return consent;
}

function applyConsent(consent) {
  // Google Analytics — only load if analytics consent given
  if (consent.analytics && !window._gaLoaded) {
    window._gaLoaded = true;
    // Replace G-XXXXXXXXXX with your actual GA4 Measurement ID
    const GA_ID = "G-XXXXXXXXXX";
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", GA_ID);
    };
  }

  // Google AdSense — only load if advertising consent given
  if (consent.advertising && !window._adsenseLoaded) {
    window._adsenseLoaded = true;
    // Replace ca-pub-XXXXXXXXXXXXXXXXX with your actual AdSense publisher ID
    const ADSENSE_ID = "ca-pub-XXXXXXXXXXXXXXXXX";
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  useEffect(() => {
    const existing = loadConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      // Slight delay so it doesn't flash immediately on load
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  function acceptAll() {
    saveConsent(true, true);
    setVisible(false);
  }

  function rejectAll() {
    saveConsent(false, false);
    setVisible(false);
  }

  function saveCustom() {
    saveConsent(analytics, advertising);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 9998,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Banner */}
      <div
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 9999,
          background: "white",
          borderTop: "3px solid #059669",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
          fontSize: "14px",
          color: "#374151",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 20px" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{
              width: "36px", height: "36px", background: "linear-gradient(135deg, #059669, #0284c7)",
              borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: "bold", fontSize: "14px", flexShrink: 0,
            }}>
              WL
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "16px", color: "#111827" }}>
                🍪 WasteLocate uses cookies
              </div>
              <div style={{ color: "#6b7280", fontSize: "13px" }}>
                We use cookies to improve your experience and show relevant ads.
              </div>
            </div>
          </div>

          <p style={{ color: "#4b5563", lineHeight: "1.6", marginBottom: "16px" }}>
            We use <strong>strictly necessary cookies</strong> to keep you logged in.
            With your consent, we also use <strong>analytics cookies</strong> to understand how the site
            is used, and <strong>advertising cookies</strong> to show relevant ads that help fund WasteLocate.
            See our{" "}
            <a href="/privacy.html" style={{ color: "#059669" }} target="_blank" rel="noreferrer">Privacy Policy</a>
            {" "}and{" "}
            <a href="/cookies.html" style={{ color: "#059669" }} target="_blank" rel="noreferrer">Cookie Policy</a>.
          </p>

          {/* Custom settings panel */}
          {showDetails && (
            <div style={{
              background: "#f9fafb", border: "1px solid #e5e7eb",
              borderRadius: "10px", padding: "16px", marginBottom: "16px",
            }}>
              <div style={{ fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Manage Cookie Preferences
              </div>

              {/* Necessary — always on */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                <div style={{ marginTop: "2px" }}>
                  <div style={{
                    width: "40px", height: "22px", background: "#d1d5db",
                    borderRadius: "11px", position: "relative", cursor: "not-allowed",
                  }}>
                    <div style={{
                      width: "18px", height: "18px", background: "#9ca3af",
                      borderRadius: "50%", position: "absolute", top: "2px", left: "2px",
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "13px" }}>Strictly Necessary <span style={{ background: "#d1fae5", color: "#065f46", padding: "1px 8px", borderRadius: "10px", fontSize: "11px" }}>Always On</span></div>
                  <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>Required for login and site security. Cannot be disabled.</div>
                </div>
              </label>

              {/* Analytics */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px", cursor: "pointer" }}>
                <div style={{ marginTop: "2px" }} onClick={() => setAnalytics(a => !a)}>
                  <div style={{
                    width: "40px", height: "22px",
                    background: analytics ? "#059669" : "#d1d5db",
                    borderRadius: "11px", position: "relative",
                    transition: "background 0.2s", cursor: "pointer",
                  }}>
                    <div style={{
                      width: "18px", height: "18px", background: "white",
                      borderRadius: "50%", position: "absolute", top: "2px",
                      left: analytics ? "20px" : "2px",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "13px" }}>Analytics Cookies</div>
                  <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>Google Analytics — helps us understand how visitors use WasteLocate so we can improve it.</div>
                </div>
              </label>

              {/* Advertising */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                <div style={{ marginTop: "2px" }} onClick={() => setAdvertising(a => !a)}>
                  <div style={{
                    width: "40px", height: "22px",
                    background: advertising ? "#059669" : "#d1d5db",
                    borderRadius: "11px", position: "relative",
                    transition: "background 0.2s", cursor: "pointer",
                  }}>
                    <div style={{
                      width: "18px", height: "18px", background: "white",
                      borderRadius: "50%", position: "absolute", top: "2px",
                      left: advertising ? "20px" : "2px",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "13px" }}>Advertising Cookies</div>
                  <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>Google AdSense — allows us to show relevant ads that help fund the free tier of WasteLocate.</div>
                </div>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <button
              onClick={acceptAll}
              style={{
                padding: "10px 24px", background: "#059669", color: "white",
                border: "none", borderRadius: "8px", fontWeight: "600",
                cursor: "pointer", fontSize: "14px",
              }}
            >
              Accept All
            </button>

            <button
              onClick={rejectAll}
              style={{
                padding: "10px 24px", background: "white", color: "#374151",
                border: "2px solid #d1d5db", borderRadius: "8px", fontWeight: "600",
                cursor: "pointer", fontSize: "14px",
              }}
            >
              Reject Non-Essential
            </button>

            {showDetails ? (
              <button
                onClick={saveCustom}
                style={{
                  padding: "10px 24px", background: "#0284c7", color: "white",
                  border: "none", borderRadius: "8px", fontWeight: "600",
                  cursor: "pointer", fontSize: "14px",
                }}
              >
                Save My Choices
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  padding: "10px 24px", background: "transparent", color: "#059669",
                  border: "none", fontWeight: "600", cursor: "pointer", fontSize: "14px",
                  textDecoration: "underline",
                }}
              >
                Customise
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
