"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStudentOffers, updateOfferStatus } from "@/lib/student/offers";
import { getStudentProfile } from "@/lib/student/jobs";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  issued:   { label: "Offer Received", bg: "var(--info-light)",    color: "var(--info-text)" },
  accepted: { label: "Accepted",       bg: "var(--success-light)", color: "var(--success-text)" },
  declined: { label: "Declined",       bg: "var(--error-light)",   color: "var(--error-text)" },
};

export default function StudentOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const student = await getStudentProfile(user.id);
      setOffers(await getStudentOffers(student.id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function respond(id: string, status: "accepted" | "declined") {
    setResponding(id);
    try {
      await updateOfferStatus(id, status);
      await load();
    } finally { setResponding(null); }
  }

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="My Offers" description="View and respond to your placement offers." />

      <div style={{ padding: "20px 28px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {loading ? (
          <Card><div style={{ height: 80, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>
        ) : offers.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎁</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>No offers yet</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Once a company extends an offer, it will appear here.</p>
            </div>
          </Card>
        ) : (
          offers.map(offer => {
            const cfg = STATUS_CONFIG[offer.offer_status] ?? STATUS_CONFIG.issued;
            const isPending = offer.offer_status === "issued";
            return (
              <Card key={offer.id} hover>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                      {offer.applications?.jobs?.title ?? "Job Offer"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {offer.applications?.jobs?.company_name ?? "—"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16, padding: "14px 0", borderTop: "1px solid var(--border-secondary)", borderBottom: isPending ? "1px solid var(--border-secondary)" : undefined, marginBottom: isPending ? 16 : 0 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Package</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--success)" }}>{offer.package_lpa ? `${offer.package_lpa} LPA` : "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Joining Date</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {offer.joining_date ? new Date(offer.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </div>
                  </div>
                  {offer.offer_issued_at && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Issued On</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {new Date(offer.offer_issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  )}
                  {offer.remarks && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Remarks</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{offer.remarks}</div>
                    </div>
                  )}
                </div>

                {isPending && (
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => respond(offer.id, "declined")}
                      disabled={responding === offer.id}
                      style={{ padding: "8px 20px", borderRadius: "var(--radius-md)", border: "1px solid var(--error)", background: "transparent", color: "var(--error)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all var(--transition-fast)", opacity: responding === offer.id ? 0.6 : 1 }}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => respond(offer.id, "accepted")}
                      disabled={responding === offer.id}
                      style={{ padding: "8px 20px", borderRadius: "var(--radius-md)", border: "none", background: "var(--success)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all var(--transition-fast)", opacity: responding === offer.id ? 0.6 : 1 }}
                    >
                      {responding === offer.id ? "Saving…" : "Accept Offer"}
                    </button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}