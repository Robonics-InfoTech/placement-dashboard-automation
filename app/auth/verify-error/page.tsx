import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verification Failed — PlacementHub",
  description: "We couldn't verify your email address. Please try again.",
};

const REASON_MESSAGES: Record<string, { title: string; body: string }> = {
  expired: {
    title: "Link expired",
    body: "This verification link has expired. Links are valid for 24 hours. Please sign up again to receive a new link.",
  },
  invalid: {
    title: "Invalid link",
    body: "This verification link is invalid or has already been used. Please sign up again or contact support.",
  },
  invalid_link: {
    title: "Broken link",
    body: "The link appears to be malformed. Please use the full link from your email, or sign up again.",
  },
};

function VerifyErrorInner() {
  // Note: searchParams unavailable in server component without "use client"
  // We use a static fallback; the reason param is for future JS enhancement
  const defaultMsg = REASON_MESSAGES["invalid"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        .root {
          min-height: 100vh;
          background: #070D1B;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.12;
          pointer-events: none;
        }
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          box-shadow: 0 0 60px rgba(239,68,68,0.06), 0 32px 64px rgba(0,0,0,0.5);
          padding: 48px 40px;
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .icon-wrap {
          width: 80px;
          height: 80px;
          background: rgba(239,68,68,0.1);
          border: 2px solid rgba(239,68,68,0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          font-size: 36px;
          animation: pop 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes pop {
          from { opacity:0; transform: scale(0.5); }
          to   { opacity:1; transform: scale(1); }
        }
        h1 {
          font-size: 22px;
          font-weight: 800;
          color: #F1F5FF;
          margin: 0 0 12px;
          letter-spacing: -0.4px;
        }
        p {
          font-size: 14px;
          color: #64748B;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .btn-row { display: flex; flex-direction: column; gap: 10px; }
        .btn-primary {
          display: block;
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border-radius: 12px;
          text-decoration: none;
          transition: opacity 0.2s;
          text-align: center;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-ghost {
          display: block;
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(99,102,241,0.25);
          color: #818CF8;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
          text-align: center;
        }
        .btn-ghost:hover {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.5);
        }
      `}</style>

      <div className="root">
        <div className="orb" style={{ width: 400, height: 400, background: "#EF4444", top: -100, left: -100 }} />
        <div className="orb" style={{ width: 300, height: 300, background: "#6366F1", bottom: -80, right: -80 }} />

        <div className="card">
          <div className="icon-wrap" role="img" aria-label="Error">❌</div>
          <h1 id="verify-error-title">{defaultMsg.title}</h1>
          <p id="verify-error-body">{defaultMsg.body}</p>

          <div className="btn-row">
            <Link href="/auth/signup" id="btn-try-signup-again" className="btn-primary">
              Sign Up Again
            </Link>
            <Link href="/auth/login" id="btn-go-to-login-error" className="btn-ghost">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyErrorPage() {
  return (
    <Suspense>
      <VerifyErrorInner />
    </Suspense>
  );
}
