import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email Verified — PlacementHub",
  description: "Your PlacementHub account has been successfully verified.",
};

export default function VerifiedPage() {
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
          opacity: 0.15;
          pointer-events: none;
        }
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          box-shadow: 0 0 60px rgba(99,102,241,0.08), 0 32px 64px rgba(0,0,0,0.5);
          padding: 48px 40px;
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .check-wrap {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
          border: 2px solid rgba(99,102,241,0.4);
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
          font-size: 24px;
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
        .btn {
          display: inline-block;
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
          letter-spacing: 0.2px;
        }
        .btn:hover { opacity: 0.88; }
      `}</style>

      <div className="root">
        <div className="orb" style={{ width: 400, height: 400, background: "#6366F1", top: -100, left: -100 }} />
        <div className="orb" style={{ width: 300, height: 300, background: "#8B5CF6", bottom: -80, right: -80 }} />

        <div className="card">
          <div className="check-wrap" role="img" aria-label="Success">✅</div>
          <h1>You&apos;re verified!</h1>
          <p>
            Your email has been confirmed and your PlacementHub account is now active.
            Sign in to get started.
          </p>
          <Link href="/auth/login" id="btn-go-to-login" className="btn">
            Go to Sign In →
          </Link>
        </div>
      </div>
    </>
  );
}
