"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { MessageSquare, Send, CheckCircle } from "lucide-react";

const CATEGORIES = ["General", "Technical Issue", "Profile Help", "Job/Drive Query", "Offer Related", "Other"];

export default function FeedbackPage() {
  const [form, setForm] = useState({ category: "", subject: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.subject || !form.body.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("You must be logged in."); return; }

      const { error: dbErr } = await supabase.from("feedback").insert({
        user_id: user.id,
        category: form.category.toLowerCase().replace(/\s+/g, "_"),
        subject: form.subject,
        body: form.body,
      });

      if (dbErr) throw dbErr;
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-md)",
    background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none",
  };

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="Feedback" description="Report issues, ask questions or share suggestions with your placement office." />

      <div style={{ padding: "20px 28px 0", maxWidth: 640 }}>
        {sent ? (
          <Card>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <CheckCircle size={48} style={{ color: "var(--success)", margin: "0 auto 16px", display: "block" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Feedback Submitted!</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Your placement office has been notified and will respond soon.</p>
              <button
                onClick={() => { setSent(false); setForm({ category: "", subject: "", body: "" }); }}
                style={{ padding: "8px 20px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Submit Another
              </button>
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <MessageSquare size={20} style={{ color: "var(--accent-text)" }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>New Feedback</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required style={inputStyle}>
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Briefly describe your issue or suggestion"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Message</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Provide as much detail as possible…"
                  rows={5}
                  required
                  style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                />
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--error-light)", color: "var(--error-text)", fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "var(--font-sans)" }}
              >
                <Send size={15} />
                {loading ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
