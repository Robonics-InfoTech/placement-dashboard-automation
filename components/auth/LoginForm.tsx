"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getRoleHome } from "@/lib/auth/role-redirect";
import DemoAccountSelector from "./DemoAccountSelector";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
    const role = user.user_metadata?.role as string | undefined;

    if (!role) {
      setError("Unable to determine your role. Please contact support.");
      setLoading(false);
      return;
    }

    window.location.href = getRoleHome(role);
  };

  const handleDemoSelect = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        padding: 20,
        position: "relative",
      }}
    >
      {/* Theme toggle in corner */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-lg)",
              background: "var(--accent-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            P
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              marginTop: 6,
            }}
          >
            Sign in to your PlacementHub account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-md)",
            padding: "28px 28px 24px",
          }}
        >
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-ring"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-primary)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus-ring"
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-primary)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                    transition: "border-color var(--transition-fast)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    padding: 4,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--error-light)",
                  color: "var(--error-text)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="focus-ring"
              style={{
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--accent-primary)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "var(--font-sans)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all var(--transition-fast)",
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Demo accounts */}
          <DemoAccountSelector onSelect={handleDemoSelect} />
        </div>

        {/* Footer link */}
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            style={{
              color: "var(--accent-text)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Create one
          </a>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}