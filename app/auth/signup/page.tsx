"use client";

import { useState, useCallback, FormEvent } from "react";
import type { UserRole } from "@/types/auth";
import ImageUpload from "@/components/ui/ImageUpload";
import { CLD_FOLDERS } from "@/lib/cloudinary";

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
  gradient: string;
  border: string;
}[] = [
  {
    id: "student",
    label: "Student",
    subtitle: "Find internships, full-time roles & placement drives",
    icon: "🎓",
    gradient: "from-violet-600/20 to-indigo-600/20",
    border: "border-violet-500/40",
  },
  {
    id: "employer",
    label: "Employer",
    subtitle: "Post jobs, connect with top campus talent",
    icon: "🏢",
    gradient: "from-indigo-600/20 to-blue-600/20",
    border: "border-indigo-500/40",
  },
  {
    id: "college_admin",
    label: "College Admin",
    subtitle: "Manage placements, drives and student outcomes",
    icon: "🏛️",
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/40",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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
  // Cloudinary upload URL (photo for student, logo for employer)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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
    setUploadedUrl(null); // reset upload when switching roles
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

    setLoading(true);
    setError(null);

    // Build payload per role
    const base = { email: form.email, password: form.password, role: selectedRole };
    let payload: Record<string, unknown> = { ...base };

    if (selectedRole === "student") {
      payload = {
        ...base,
        full_name: form.full_name,
        roll_number: form.roll_number,
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

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .signup-root {
          min-height: 100vh;
          background: #070D1B;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        /* Animated background orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: drift 12s ease-in-out infinite;
        }
        .orb-1 {
          width: 520px; height: 520px;
          background: #6366F1;
          top: -140px; left: -120px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 420px; height: 420px;
          background: #8B5CF6;
          bottom: -100px; right: -100px;
          animation-delay: -4s;
        }
        .orb-3 {
          width: 280px; height: 280px;
          background: #06B6D4;
          top: 50%; left: 60%;
          animation-delay: -8s;
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -25px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.96); }
        }

        /* Grid overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Card container */
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          box-shadow: 0 0 60px rgba(99,102,241,0.08), 0 32px 64px rgba(0,0,0,0.5);
          animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* Card header */
        .card-header {
          padding: 32px 36px 0;
          text-align: center;
        }
        .logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 12px;
          padding: 8px 16px;
          margin-bottom: 24px;
        }
        .logo-badge span {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
        }
        .card-title {
          font-size: 26px;
          font-weight: 800;
          color: #F1F5FF;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .card-subtitle {
          font-size: 14px;
          color: #64748B;
          margin: 0 0 28px;
        }

        /* Role selector */
        .role-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 36px 36px;
        }
        .role-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s ease;
          text-align: left;
        }
        .role-card:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.5);
          transform: translateX(4px);
          box-shadow: 0 0 20px rgba(99,102,241,0.12);
        }
        .role-icon {
          font-size: 28px;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.12);
          border-radius: 12px;
          flex-shrink: 0;
        }
        .role-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: #E2E8F0;
          margin: 0 0 4px;
        }
        .role-info p {
          font-size: 12px;
          color: #64748B;
          margin: 0;
          line-height: 1.4;
        }
        .role-arrow {
          margin-left: auto;
          color: #4B5563;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .role-card:hover .role-arrow {
          transform: translateX(4px);
          color: #818CF8;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 36px;
          margin-bottom: 20px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(99,102,241,0.15);
        }
        .divider-text {
          font-size: 11px;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        /* Form */
        .form-body {
          padding: 0 36px 36px;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6366F1;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 0 20px;
          transition: opacity 0.2s;
        }
        .back-btn:hover { opacity: 0.7; }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          color: #818CF8;
          margin-bottom: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-size: 12px;
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .input-wrap {
          position: relative;
        }
        .field input,
        .field select {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 10px;
          color: #F1F5FF;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .field input::placeholder { color: #374151; }
        .field input:focus,
        .field select:focus {
          border-color: #6366F1;
          background: rgba(99,102,241,0.07);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .field select option { background: #131929; color: #F1F5FF; }

        .pw-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #4B5563;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          padding: 0;
        }
        .pw-toggle:hover { color: #818CF8; }
        .field input.has-toggle { padding-right: 42px; }

        .hint {
          font-size: 11px;
          color: #374151;
          margin-top: 2px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 20px;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.2px;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .submit-btn:hover::after { background: rgba(255,255,255,0.08); }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Error alert */
        .error-alert {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 12px 14px;
          margin-top: 16px;
          font-size: 13px;
          color: #FCA5A5;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        /* Sign in link */
        .signin-row {
          text-align: center;
          padding: 20px 36px;
          border-top: 1px solid rgba(99,102,241,0.1);
          font-size: 13px;
          color: #4B5563;
        }
        .signin-row a {
          color: #818CF8;
          text-decoration: none;
          font-weight: 600;
          margin-left: 4px;
          transition: opacity 0.2s;
        }
        .signin-row a:hover { opacity: 0.75; }

        /* Success screen */
        .success-body {
          padding: 36px;
          text-align: center;
        }
        .success-icon {
          font-size: 56px;
          margin-bottom: 20px;
          display: block;
          animation: pop 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes pop {
          from { opacity:0; transform: scale(0.5); }
          to   { opacity:1; transform: scale(1); }
        }
        .success-title {
          font-size: 22px;
          font-weight: 800;
          color: #F1F5FF;
          margin: 0 0 10px;
        }
        .success-sub {
          font-size: 14px;
          color: #64748B;
          margin: 0 0 8px;
          line-height: 1.6;
        }
        .success-email {
          font-size: 14px;
          font-weight: 600;
          color: #818CF8;
          margin: 0 0 24px;
          word-break: break-all;
        }
        .success-tip {
          font-size: 12px;
          color: #374151;
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 8px;
          padding: 10px 14px;
          line-height: 1.5;
        }
      `}</style>

      <div className="signup-root">
        {/* Background */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />

        <div className="card">
          {/* ── Step: Role selector ─────────────────────────────────── */}
          {step === "role" && (
            <>
              <div className="card-header">
                <div className="logo-badge">
                  <span>🎯 PlacementHub</span>
                </div>
                <h1 className="card-title">Create your account</h1>
                <p className="card-subtitle">
                  Choose how you&apos;ll use PlacementHub
                </p>
              </div>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">I am a</span>
                <div className="divider-line" />
              </div>

              <div className="role-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    id={`role-${r.id}`}
                    className="role-card"
                    onClick={() => handleRoleSelect(r.id)}
                    type="button"
                  >
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-info">
                      <h3>{r.label}</h3>
                      <p>{r.subtitle}</p>
                    </div>
                    <svg className="role-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="signin-row">
                Already have an account?
                <a href="/auth/login" id="link-to-login">Sign in</a>
              </div>
            </>
          )}

          {/* ── Step: Form ──────────────────────────────────────────── */}
          {step === "form" && selectedRole && (
            <>
              <div className="card-header">
                <div className="logo-badge">
                  <span>🎯 PlacementHub</span>
                </div>
                <h1 className="card-title">
                  {selectedRole === "student" && "Student Sign Up"}
                  {selectedRole === "employer" && "Employer Sign Up"}
                  {selectedRole === "college_admin" && "College Admin Sign Up"}
                </h1>
                <p className="card-subtitle">Fill in your details below</p>
              </div>

              <form className="form-body" onSubmit={handleSubmit} noValidate>
                <button
                  type="button"
                  className="back-btn"
                  onClick={handleBack}
                  id="btn-back-to-role"
                >
                  ← Back
                </button>

                <div className="role-badge">
                  {ROLES.find((r) => r.id === selectedRole)?.icon}{" "}
                  {ROLES.find((r) => r.id === selectedRole)?.label}
                </div>

                <div className="field-group">

                  {/* ── Student fields ──────────────────────────────── */}
                  {selectedRole === "student" && (
                    <>
                      <div className="field">
                        <label htmlFor="full_name">Full Name</label>
                        <input
                          id="full_name"
                          type="text"
                          placeholder="Aarav Sharma"
                          value={form.full_name}
                          onChange={handleField("full_name")}
                          required
                          autoComplete="name"
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="batch_year">Passout Year</label>
                        <input
                          id="batch_year"
                          type="number"
                          placeholder="2025"
                          value={form.batch_year}
                          onChange={handleField("batch_year")}
                          min="2000"
                          max="2040"
                          required
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="branch">Branch</label>
                        <select
                          id="branch"
                          value={form.branch}
                          onChange={handleField("branch")}
                          required
                        >
                          <option value="">Select branch…</option>
                          {BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor="enrollment_key">College Enrollment Key</label>
                        <input
                          id="enrollment_key"
                          type="text"
                          placeholder="Provided by your TPO"
                          value={form.enrollment_key}
                          onChange={handleField("enrollment_key")}
                          required
                        />
                        <span className="hint">Ask your Training &amp; Placement Officer for this key.</span>
                      </div>
                    </>
                  )}

                  {/* ── Employer fields ─────────────────────────────── */}
                  {selectedRole === "employer" && (
                    <>
                      <div className="field">
                        <label htmlFor="company_name">Company Name</label>
                        <input
                          id="company_name"
                          type="text"
                          placeholder="Acme Corp Pvt. Ltd."
                          value={form.company_name}
                          onChange={handleField("company_name")}
                          required
                        />
                      </div>

                      <div className="field-row">
                        <div className="field">
                          <label htmlFor="industry">Industry</label>
                          <select
                            id="industry"
                            value={form.industry}
                            onChange={handleField("industry")}
                            required
                          >
                            <option value="">Select…</option>
                            {INDUSTRIES.map((i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label htmlFor="hq_location">HQ Location</label>
                          <input
                            id="hq_location"
                            type="text"
                            placeholder="Bengaluru, KA"
                            value={form.hq_location}
                            onChange={handleField("hq_location")}
                            required
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="hr_contact_name">HR Contact Name</label>
                        <input
                          id="hr_contact_name"
                          type="text"
                          placeholder="Priya Mehta"
                          value={form.hr_contact_name}
                          onChange={handleField("hr_contact_name")}
                          required
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
                      <div className="field">
                        <label htmlFor="full_name">Full Name</label>
                        <input
                          id="full_name"
                          type="text"
                          placeholder="Dr. Rajesh Kumar"
                          value={form.full_name}
                          onChange={handleField("full_name")}
                          required
                          autoComplete="name"
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="designation">Designation</label>
                        <input
                          id="designation"
                          type="text"
                          placeholder="Training & Placement Officer"
                          value={form.designation}
                          onChange={handleField("designation")}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* ── Common: email + password ─────────────────────── */}
                  <div className="field">
                    <label htmlFor="email">Email Address</label>
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
                    />
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="password">Password</label>
                      <div className="input-wrap">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={form.password}
                          onChange={handleField("password")}
                          required
                          autoComplete="new-password"
                          className="has-toggle"
                        />
                        <button
                          type="button"
                          className="pw-toggle"
                          onClick={() => setShowPassword((p) => !p)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="confirm_password">Confirm Password</label>
                      <div className="input-wrap">
                        <input
                          id="confirm_password"
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={handleField("confirmPassword")}
                          required
                          autoComplete="new-password"
                          className="has-toggle"
                        />
                        <button
                          type="button"
                          className="pw-toggle"
                          onClick={() => setShowConfirm((p) => !p)}
                          aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <span className="hint">
                    Must be 8+ characters with uppercase, lowercase and a number.
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="error-alert" role="alert">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  id="btn-create-account"
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Creating account…
                    </>
                  ) : (
                    "Create Account →"
                  )}
                </button>
              </form>

              <div className="signin-row">
                Already have an account?
                <a href="/auth/login" id="link-to-login-form">Sign in</a>
              </div>
            </>
          )}

          {/* ── Step: Success ───────────────────────────────────────── */}
          {step === "success" && (
            <div className="success-body">
              <span className="success-icon" role="img" aria-label="Email sent">
                📬
              </span>
              <h1 className="success-title">Check your inbox!</h1>
              <p className="success-sub">
                We sent a verification link to
              </p>
              <p className="success-email">{successEmail}</p>
              <p className="success-tip">
                Click the link in the email to activate your account. <br />
                Didn&apos;t receive it? Check your spam folder or{" "}
                <a
                  href="/auth/signup"
                  style={{ color: "#818CF8", textDecoration: "none", fontWeight: 600 }}
                >
                  try again
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
