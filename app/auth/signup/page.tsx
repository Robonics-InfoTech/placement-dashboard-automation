"use client";

import { useState, useCallback, FormEvent } from "react";
import type { UserRole } from "@/types/auth";
import ImageUpload from "@/components/ui/ImageUpload";
import { CLD_FOLDERS } from "@/lib/cloudinary";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Eye, EyeOff, Loader2, ChevronRight, ArrowLeft } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "role" | "form" | "success";

interface FormState {
  // Common
  email: string;
  password: string;
  confirmPassword: string;
  // Student
  full_name: string;
  branch: string;
  batch_year: string;
  enrollment_key: string;
  // Employer
  company_name: string;
  industry: string;
  hq_location: string;
  hr_contact_name: string;
  // College Admin
  designation: string;
}

const INITIAL_FORM: FormState = {
  email: "",
  password: "",
  confirmPassword: "",
  full_name: "",
  branch: "",
  batch_year: "",
  enrollment_key: "",
  company_name: "",
  industry: "",
  hq_location: "",
  hr_contact_name: "",
  designation: "",
};

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Other",
];

const INDUSTRIES = [
  "Technology / Software",
  "Finance / Banking",
  "Healthcare",
  "Manufacturing",
  "Consulting",
  "E-Commerce",
  "Telecommunications",
  "Education",
  "Other",
];

// ─── Role Card Data ───────────────────────────────────────────────────────────

const ROLES: {
  id: UserRole;
  label: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    id: "student",
    label: "Student",
    subtitle: "Find internships, full-time roles & placement drives",
    icon: "🎓",
  },
  {
    id: "employer",
    label: "Employer",
    subtitle: "Post jobs, connect with top campus talent",
    icon: "🏢",
  },
  {
    id: "college_admin",
    label: "College Admin",
    subtitle: "Manage placements, drives and student outcomes",
    icon: "🏛️",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SignupPage() {
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleField = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
      },
    []
  );

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("form");
    setError(null);
    setUploadedUrl(null);
  };

  const handleBack = () => {
    setStep("role");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    const base = { email: form.email, password: form.password, role: selectedRole };
    let payload: Record<string, unknown> = { ...base };

    if (selectedRole === "student") {
      payload = {
        ...base,
        full_name: form.full_name,
        branch: form.branch,
        batch_year: parseInt(form.batch_year, 10),
        enrollment_key: form.enrollment_key,
        ...(uploadedUrl ? { photo_url: uploadedUrl } : {}),
      };
    } else if (selectedRole === "employer") {
      payload = {
        ...base,
        company_name: form.company_name,
        industry: form.industry,
        hq_location: form.hq_location,
        hr_contact_name: form.hr_contact_name,
        ...(uploadedUrl ? { logo_url: uploadedUrl } : {}),
      };
    } else if (selectedRole === "college_admin") {
      payload = {
        ...base,
        full_name: form.full_name,
        designation: form.designation,
        enrollment_key: form.enrollment_key,
      };
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccessEmail(form.email);
      setStep("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared input style ──────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 6,
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  // ─── Render ──────────────────────────────────────────────────────────────

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
      {/* Theme toggle */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: "100%", maxWidth: step === "form" ? 480 : 420 }}>
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
            {step === "success" ? "Check your inbox!" : "Create your account"}
          </h1>
          {step === "role" && (
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
              Choose how you&apos;ll use PlacementHub
            </p>
          )}
          {step === "form" && selectedRole && (
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
              Fill in your details to get started
            </p>
          )}
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
          }}
        >
          {/* ── Step: Role selector ─────────────────────────────────── */}
          {step === "role" && (
            <>
              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "20px 24px 0",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border-primary)",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: 600,
                  }}
                >
                  I am a
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border-primary)",
                  }}
                />
              </div>

              {/* Role cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 24px 24px" }}>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    id={`role-${r.id}`}
                    onClick={() => handleRoleSelect(r.id)}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all var(--transition-fast)",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = "var(--accent-primary)";
                      el.style.background = "var(--accent-lighter)";
                      el.style.transform = "translateX(2px)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = "var(--border-primary)";
                      el.style.background = "var(--bg-primary)";
                      el.style.transform = "translateX(0)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--accent-light)",
                        borderRadius: "var(--radius-md)",
                        flexShrink: 0,
                      }}
                    >
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        {r.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {r.subtitle}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>

              {/* Footer link */}
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 24px",
                  borderTop: "1px solid var(--border-primary)",
                  fontSize: 14,
                  color: "var(--text-secondary)",
                }}
              >
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  id="link-to-login"
                  style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}
                >
                  Sign in
                </a>
              </div>
            </>
          )}

          {/* ── Step: Form ──────────────────────────────────────────── */}
          {step === "form" && selectedRole && (
            <form onSubmit={handleSubmit} noValidate style={{ padding: "24px 28px" }}>
              {/* Back + Role badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <button
                  type="button"
                  id="btn-back-to-role"
                  onClick={handleBack}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    color: "var(--accent-text)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--accent-light)",
                    border: "1px solid var(--accent-primary)",
                    borderRadius: "var(--radius-full)",
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--accent-text)",
                  }}
                >
                  {ROLES.find((r) => r.id === selectedRole)?.icon}{" "}
                  {ROLES.find((r) => r.id === selectedRole)?.label}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* ── Student fields ──────────────────────────────── */}
                {selectedRole === "student" && (
                  <>
                    <div style={fieldStyle}>
                      <label htmlFor="full_name" style={labelStyle}>Full Name</label>
                      <input
                        id="full_name"
                        type="text"
                        placeholder="Aarav Sharma"
                        value={form.full_name}
                        onChange={handleField("full_name")}
                        required
                        autoComplete="name"
                        className="focus-ring"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={fieldStyle}>
                        <label htmlFor="batch_year" style={labelStyle}>Passout Year</label>
                        <input
                          id="batch_year"
                          type="number"
                          placeholder="2025"
                          value={form.batch_year}
                          onChange={handleField("batch_year")}
                          min="2000"
                          max="2040"
                          required
                          className="focus-ring"
                          style={inputStyle}
                        />
                      </div>

                      <div style={fieldStyle}>
                        <label htmlFor="branch" style={labelStyle}>Branch</label>
                        <select
                          id="branch"
                          value={form.branch}
                          onChange={handleField("branch")}
                          required
                          className="focus-ring"
                          style={inputStyle}
                        >
                          <option value="">Select branch…</option>
                          {BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={fieldStyle}>
                      <label htmlFor="enrollment_key" style={labelStyle}>College Enrollment Key</label>
                      <input
                        id="enrollment_key"
                        type="text"
                        placeholder="Provided by your TPO"
                        value={form.enrollment_key}
                        onChange={handleField("enrollment_key")}
                        required
                        className="focus-ring"
                        style={inputStyle}
                      />
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Ask your Training &amp; Placement Officer for this key.
                      </span>
                    </div>
                  </>
                )}

                {/* ── Employer fields ─────────────────────────────── */}
                {selectedRole === "employer" && (
                  <>
                    <div style={fieldStyle}>
                      <label htmlFor="company_name" style={labelStyle}>Company Name</label>
                      <input
                        id="company_name"
                        type="text"
                        placeholder="Acme Corp Pvt. Ltd."
                        value={form.company_name}
                        onChange={handleField("company_name")}
                        required
                        className="focus-ring"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={fieldStyle}>
                        <label htmlFor="industry" style={labelStyle}>Industry</label>
                        <select
                          id="industry"
                          value={form.industry}
                          onChange={handleField("industry")}
                          required
                          className="focus-ring"
                          style={inputStyle}
                        >
                          <option value="">Select…</option>
                          {INDUSTRIES.map((i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                      <div style={fieldStyle}>
                        <label htmlFor="hq_location" style={labelStyle}>HQ Location</label>
                        <input
                          id="hq_location"
                          type="text"
                          placeholder="Bengaluru, KA"
                          value={form.hq_location}
                          onChange={handleField("hq_location")}
                          required
                          className="focus-ring"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={fieldStyle}>
                      <label htmlFor="hr_contact_name" style={labelStyle}>HR Contact Name</label>
                      <input
                        id="hr_contact_name"
                        type="text"
                        placeholder="Priya Mehta"
                        value={form.hr_contact_name}
                        onChange={handleField("hr_contact_name")}
                        required
                        className="focus-ring"
                        style={inputStyle}
                      />
                    </div>

                    <ImageUpload
                      folder={CLD_FOLDERS.employerLogos}
                      label="Company Logo"
                      placeholder="Upload your company logo (optional)"
                      onUpload={(url) => setUploadedUrl(url)}
                    />
                  </>
                )}

                {/* ── College Admin fields ─────────────────────────── */}
                {selectedRole === "college_admin" && (
                  <>
                    <div style={fieldStyle}>
                      <label htmlFor="full_name" style={labelStyle}>Full Name</label>
                      <input
                        id="full_name"
                        type="text"
                        placeholder="Dr. Rajesh Kumar"
                        value={form.full_name}
                        onChange={handleField("full_name")}
                        required
                        autoComplete="name"
                        className="focus-ring"
                        style={inputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label htmlFor="designation" style={labelStyle}>Designation</label>
                      <input
                        id="designation"
                        type="text"
                        placeholder="Training & Placement Officer"
                        value={form.designation}
                        onChange={handleField("designation")}
                        required
                        className="focus-ring"
                        style={inputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label htmlFor="enrollment_key" style={labelStyle}>College Enrollment Key</label>
                      <input
                        id="enrollment_key"
                        type="text"
                        placeholder="Provided by your institution"
                        value={form.enrollment_key}
                        onChange={handleField("enrollment_key")}
                        required
                        className="focus-ring"
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}

                {/* ── Common: email ─────────────────────────────────── */}
                <div style={fieldStyle}>
                  <label htmlFor="email" style={labelStyle}>Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder={
                      selectedRole === "student"
                        ? "aarav@college.edu"
                        : selectedRole === "employer"
                        ? "hr@company.com"
                        : "tpo@college.edu"
                    }
                    value={form.email}
                    onChange={handleField("email")}
                    required
                    autoComplete="email"
                    className="focus-ring"
                    style={inputStyle}
                  />
                </div>

                {/* ── Password row ──────────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={fieldStyle}>
                    <label htmlFor="password" style={labelStyle}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={handleField("password")}
                        required
                        autoComplete="new-password"
                        className="focus-ring"
                        style={{ ...inputStyle, paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
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

                  <div style={fieldStyle}>
                    <label htmlFor="confirm_password" style={labelStyle}>Confirm Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="confirm_password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat password"
                        value={form.confirmPassword}
                        onChange={handleField("confirmPassword")}
                        required
                        autoComplete="new-password"
                        className="focus-ring"
                        style={{ ...inputStyle, paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
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
                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Must be 8+ characters with uppercase, lowercase and a number.
                </span>

                {/* T&C checkbox */}
                <label
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}
                  htmlFor="terms-checkbox"
                >
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => { setTermsAccepted(e.target.checked); setError(null); }}
                    style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "var(--accent-primary)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    I have read and agree to the{" "}
                    <a href="/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>Terms &amp; Conditions</a>
                    {" "}and{" "}
                    <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>.
                    I consent to PlacementHub processing my personal data as described therein.
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--error-light)",
                      color: "var(--error-text)",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="btn-create-account"
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
                    marginTop: 4,
                  }}
                >
                  {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
              </div>
            </form>
          )}

          {/* ── Step: Success ───────────────────────────────────────── */}
          {step === "success" && (
            <div style={{ padding: "36px 28px", textAlign: "center" }}>
              <span
                role="img"
                aria-label="Email sent"
                style={{
                  fontSize: 52,
                  display: "block",
                  marginBottom: 20,
                  animation: "pop 0.5s cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                📬
              </span>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
                We sent a verification link to
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-text)",
                  marginBottom: 24,
                  wordBreak: "break-all",
                }}
              >
                {successEmail}
              </p>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  background: "var(--accent-lighter)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  lineHeight: 1.6,
                }}
              >
                Click the link in the email to activate your account. <br />
                Didn&apos;t receive it? Check your spam folder or{" "}
                <a
                  href="/auth/signup"
                  style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}
                >
                  try again
                </a>
                .
              </div>
            </div>
          )}

          {/* Footer link (form step) */}
          {step === "form" && (
            <div
              style={{
                textAlign: "center",
                padding: "16px 28px",
                borderTop: "1px solid var(--border-primary)",
                fontSize: 14,
                color: "var(--text-secondary)",
              }}
            >
              Already have an account?{" "}
              <a
                href="/auth/login"
                id="link-to-login-form"
                style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}
              >
                Sign in
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Spinner + pop keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
