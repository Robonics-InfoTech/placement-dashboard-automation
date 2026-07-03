"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginForm() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleLogin = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

const user = data.user;

// Role is stored in user_metadata at signup — no extra DB round-trip needed,
// and avoids RLS timing issues right after session creation.
const role = user.user_metadata?.role as string | undefined;

if (!role) {
  setError("Unable to determine your role. Please contact support.");
  setLoading(false);
  return;
}

switch (role) {
  case "student":
    window.location.href = "/student/dashboard";
    break;

  case "employer":
    window.location.href = "/employer/dashboard";
    break;

  case "college_admin":
    window.location.href = "/admin/dashboard";
    break;

  default:
    setError("Invalid user role.");
    setLoading(false);
}

};

return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .signup-root {
          min-height: 100vh;
          background: #070D1B;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Animated Background */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: drift 12s ease-in-out infinite;
          pointer-events:none;
        }

        .orb-1 {
          width: 520px;
          height: 520px;
          background: #6366F1;
          top: -140px;
          left: -120px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 420px;
          height: 420px;
          background: #8B5CF6;
          bottom: -100px;
          right: -100px;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 280px;
          height: 280px;
          background: #06B6D4;
          top: 50%;
          left: 60%;
          animation-delay: -8s;
        }

        @keyframes drift {
          0%,100% {
            transform: translate(0,0) scale(1);
          }

          33% {
            transform: translate(30px,-25px) scale(1.05);
          }

          66% {
            transform: translate(-20px,20px) scale(.96);
          }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px);

          background-size:48px 48px;
          pointer-events:none;
        }

        .card {
          position: relative;
          z-index: 10;
          width: 420px;
          padding: 40px;
          border-radius: 20px;
          background: rgba(255,255,255,.05);
          backdrop-filter: blur(20px);
          border:1px solid rgba(255,255,255,.08);
          box-shadow:0 20px 60px rgba(0,0,0,.4);
        }

        h1{
          color:white;
          text-align:center;
          margin:0;
        }

        p{
          color:#94A3B8;
          text-align:center;
          margin-top:12px;
        }
          .form{
display:flex;
flex-direction:column;
gap:18px;
margin-top:30px;
}

.field{
display:flex;
flex-direction:column;
gap:8px;
}

.field label{
color:#CBD5E1;
font-size:13px;
font-weight:600;
}

.field input{
padding:14px;
background:rgba(255,255,255,.05);
border:1px solid rgba(255,255,255,.08);
border-radius:12px;
color:white;
font-size:14px;
outline:none;
}

.field input:focus{
border-color:#6366F1;
box-shadow:0 0 0 3px rgba(99,102,241,.2);
}

.login-btn{
padding:15px;
border:none;
border-radius:12px;
background:linear-gradient(135deg,#6366F1,#8B5CF6);
color:white;
font-size:15px;
font-weight:700;
cursor:pointer;
margin-top:10px;
}

.login-btn:hover{
opacity:.9;
}

.footer{
margin-top:25px;
text-align:center;
font-size:14px;
color:#94A3B8;
}

.footer a{
color:#818CF8;
text-decoration:none;
font-weight:600;
}
      `}</style>

      <div className="signup-root">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="grid-overlay"></div>

        <div className="card">
<h1>Welcome Back</h1>

<p>Sign in to your account</p>

<form 
    className="form" 
    onSubmit={handleLogin} 
>

  <div className="field">
    <label>Email Address</label>

<input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
  </div>

  <div className="field">
    <label>Password</label>

<input
  type="password"
  placeholder="Enter your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
  </div>

{error && (
  <div className="error-alert">
    {error}
  </div>
)}

<button
  type="submit"
  className="login-btn"
  disabled={loading}
>
  {loading ? "Signing In..." : "Sign In"}
</button>

</form>

<div className="footer">
  Don't have an account?
  <a href="/auth/signup"> Create one</a>
</div>        </div>
      </div>
    </>
  );
}