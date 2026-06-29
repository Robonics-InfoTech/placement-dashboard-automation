"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * /auth/verify
 * The user lands here after clicking the email link.
 * We forward their token to the API verify route and let it redirect.
 */
function VerifyInner() {
  const searchParams = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") ?? "signup";
    const email = searchParams.get("email") ?? "";

    const url = new URL("/api/auth/verify", window.location.origin);
    url.searchParams.set("token_hash", token_hash ?? "");
    url.searchParams.set("type", type);
    url.searchParams.set("email", email);

    // Navigate to the API route — it will redirect to /auth/verified or /auth/verify-error
    window.location.href = url.toString();
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070D1B",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        color: "#94A3B8",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "3px solid rgba(99,102,241,0.2)",
          borderTopColor: "#6366F1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontSize: 15 }}>Verifying your email…</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
