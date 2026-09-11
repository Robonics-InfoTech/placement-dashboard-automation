"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, Mail, Briefcase, GraduationCap, MapPin, Phone, Calendar, Save } from "lucide-react";

interface AlumniProfile {
  full_name: string;
  email: string;
  phone: string;
  branch: string;
  batch_year: string;
  current_company: string;
  current_designation: string;
  location: string;
  linkedin_url: string;
  bio: string;
}

export default function AlumniProfilePage() {
  const [profile, setProfile] = useState<AlumniProfile>({
    full_name: "", email: "", phone: "", branch: "", batch_year: "",
    current_company: "", current_designation: "", location: "", linkedin_url: "", bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try alumni_profiles first, fallback to student_profiles
      const { data: alumni } = await supabase
        .from("alumni_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (alumni) {
        setProfile({
          full_name: alumni.full_name ?? user.user_metadata?.full_name ?? "",
          email: user.email ?? "",
          phone: alumni.phone ?? "",
          branch: alumni.branch ?? "",
          batch_year: alumni.batch_year?.toString() ?? "",
          current_company: alumni.current_company ?? "",
          current_designation: alumni.current_designation ?? "",
          location: alumni.location ?? "",
          linkedin_url: alumni.linkedin_url ?? "",
          bio: alumni.bio ?? "",
        });
      } else {
        // Fallback: check student_profiles (alumni may have been a student)
        const { data: student } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (student) {
          setProfile(p => ({
            ...p,
            full_name: student.full_name ?? "",
            email: user.email ?? "",
            phone: student.phone ?? "",
            branch: student.branch ?? "",
            batch_year: student.batch_year?.toString() ?? "",
          }));
        } else {
          setProfile(p => ({
            ...p,
            full_name: user.user_metadata?.full_name ?? "",
            email: user.email ?? "",
          }));
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("alumni_profiles").upsert({
        user_id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        branch: profile.branch,
        batch_year: parseInt(profile.batch_year) || null,
        current_company: profile.current_company,
        current_designation: profile.current_designation,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      if (error) throw error;
      setMessage({ type: "success", text: "Profile saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message ?? "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-md)",
    background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none",
  };

  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 };

  const field = (label: string, key: keyof AlumniProfile, opts?: { type?: string; placeholder?: string; icon?: React.ReactNode }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={opts?.type ?? "text"}
        value={profile[key]}
        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
        placeholder={opts?.placeholder}
        style={inputStyle}
      />
    </div>
  );

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="My Profile" description="Keep your alumni profile updated to get the best opportunities." />

      <div style={{ padding: "20px 28px 0", maxWidth: 680 }}>
        {loading ? (
          <Card><div style={{ height: 300, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>
        ) : (
          <form onSubmit={handleSave}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <User size={18} style={{ color: "var(--accent-text)" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Personal Information</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {field("Full Name", "full_name", { placeholder: "Priya Nair" })}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={profile.email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                </div>
                {field("Phone", "phone", { type: "tel", placeholder: "+91 98765 43210" })}
                {field("Location", "location", { placeholder: "Mumbai, India" })}
              </div>
            </Card>

            <div style={{ height: 16 }} />

            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <GraduationCap size={18} style={{ color: "var(--accent-text)" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Academic Background</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {field("Branch", "branch", { placeholder: "Computer Science" })}
                {field("Passout Year", "batch_year", { type: "number", placeholder: "2023" })}
              </div>
            </Card>

            <div style={{ height: 16 }} />

            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Briefcase size={18} style={{ color: "var(--accent-text)" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Professional Details</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {field("Current Company", "current_company", { placeholder: "Google India" })}
                {field("Designation", "current_designation", { placeholder: "Software Engineer" })}
                {field("LinkedIn URL", "linkedin_url", { type: "url", placeholder: "https://linkedin.com/in/..." })}
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="A brief intro about yourself and your career journey…"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                />
              </div>
            </Card>

            {message && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 600, background: message.type === "success" ? "var(--success-light)" : "var(--error-light)", color: message.type === "success" ? "var(--success-text)" : "var(--error-text)" }}>
                {message.type === "success" ? "✓" : "⚠️"} {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-sans)" }}
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
