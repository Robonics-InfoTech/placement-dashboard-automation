"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type OfferStatus = "issued" | "accepted" | "declined" | "expired" | "withdrawn";

type Offer = {
  id: string;
  offer_type: string;
  package_lpa: number | null;
  joining_date: string | null;
  offer_status: OfferStatus;
  offered_at: string;
  responded_at: string | null;
  remarks: string | null;
  employer_profiles: { company_name: string; logo_url: string | null } | null;
  applications: {
    jobs: { title: string; location: string | null; employment_type: string | null } | null;
  } | null;
};

/* ─── Confirm Modal ──────────────────────────────────────────────────────── */
function ConfirmModal({
  offer, action, onConfirm, onCancel, loading,
}: {
  offer: Offer; action: "accept" | "decline";
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  const isAccept = action === "accept";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{
        background: "#0E1629", borderRadius: 18, padding: 32, width: 460, maxWidth: "100%",
        border: `1px solid ${isAccept ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.25)"}`,
      }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 14 }}>{isAccept ? "🎉" : "😔"}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", textAlign: "center", marginBottom: 6 }}>
          {isAccept ? "Accept Offer?" : "Decline Offer?"}
        </div>
        <div style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 22, lineHeight: 1.6 }}>
          {isAccept ? (
            <>
              You are about to accept the offer from <strong style={{ color: "#E2E8F0" }}>{offer.employer_profiles?.company_name}</strong>.
              <br />
              Your profile will be marked as <strong style={{ color: "#34D399" }}>Placed</strong> and you will not be able to apply to other jobs.
            </>
          ) : (
            <>
              You are about to decline the offer from <strong style={{ color: "#E2E8F0" }}>{offer.employer_profiles?.company_name}</strong>.
              <br />
              <strong style={{ color: "#F87171" }}>This action cannot be undone.</strong>
            </>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: 14, marginBottom: 22, border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{offer.applications?.jobs?.title}</div>
          <div style={{ fontSize: 12, color: "#818CF8", marginTop: 2 }}>{offer.employer_profiles?.company_name}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "#64748B", flexWrap: "wrap" }}>
            {offer.package_lpa && <span>💰 ₹{offer.package_lpa} LPA</span>}
            {offer.joining_date && <span>📅 Joining {new Date(offer.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1.5, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: isAccept ? "linear-gradient(135deg,#10B981,#059669)" : "#DC2626",
            }}
          >
            {loading ? (
              <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", animation: "spin .8s linear infinite" }} /> Processing…</>
            ) : isAccept ? "✓ Accept Offer" : "Decline Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Offer card ─────────────────────────────────────────────────────────── */
function OfferCard({ offer, onAction }: { offer: Offer; onAction: (id: string, action: "accept" | "decline") => void }) {
  const isAccepted  = offer.offer_status === "accepted";
  const isDeclined  = offer.offer_status === "declined";
  const isPending   = offer.offer_status === "issued";
  const isExpired   = offer.offer_status === "expired" || offer.offer_status === "withdrawn";

  return (
    <div style={{
      borderRadius: 18, padding: 24, marginBottom: 16,
      background: isAccepted
        ? "linear-gradient(135deg, rgba(16,185,129,.08) 0%, rgba(5,150,105,.04) 100%)"
        : isDeclined || isExpired
        ? "rgba(255,255,255,.03)"
        : "rgba(255,255,255,.04)",
      border: `1px solid ${isAccepted ? "rgba(16,185,129,.25)" : isDeclined ? "rgba(239,68,68,.15)" : isExpired ? "rgba(255,255,255,.06)" : "rgba(99,102,241,.2)"}`,
      transition: "all .2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0, overflow: "hidden",
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "white",
          border: `2px solid ${isAccepted ? "rgba(16,185,129,.3)" : "rgba(99,102,241,.2)"}`,
        }}>
          {offer.employer_profiles?.logo_url ? (
            <img src={offer.employer_profiles.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            (offer.employer_profiles?.company_name?.[0] ?? "?").toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
              {offer.applications?.jobs?.title ?? "Job Offer"}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase",
              background: offer.offer_type === "ppo" ? "rgba(139,92,246,.15)" : "rgba(99,102,241,.12)",
              color: offer.offer_type === "ppo" ? "#C084FC" : "#818CF8",
            }}>
              {offer.offer_type?.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#818CF8", marginTop: 3 }}>{offer.employer_profiles?.company_name}</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
            Offer received {new Date(offer.offered_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0,
          background: isAccepted ? "rgba(16,185,129,.15)" : isDeclined ? "rgba(239,68,68,.1)" : isExpired ? "rgba(100,116,139,.1)" : "rgba(245,158,11,.1)",
          color: isAccepted ? "#34D399" : isDeclined ? "#F87171" : isExpired ? "#64748B" : "#FCD34D",
          border: `1px solid ${isAccepted ? "rgba(16,185,129,.25)" : isDeclined ? "rgba(239,68,68,.2)" : isExpired ? "rgba(100,116,139,.15)" : "rgba(245,158,11,.2)"}`,
        }}>
          {isAccepted ? "✓ Accepted" : isDeclined ? "✗ Declined" : isExpired ? "Expired" : "⏳ Pending"}
        </div>
      </div>

      {/* Offer details */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,.04)", marginBottom: 16 }}>
        {offer.package_lpa && (
          <div>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Package</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: isAccepted ? "#34D399" : "#E2E8F0" }}>₹{offer.package_lpa} <span style={{ fontSize: 13, fontWeight: 500 }}>LPA</span></div>
          </div>
        )}
        {offer.joining_date && (
          <div>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Joining Date</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>
              {new Date(offer.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        )}
        {offer.applications?.jobs?.location && (
          <div>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Location</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{offer.applications.jobs.location}</div>
          </div>
        )}
      </div>

      {/* Accepted congratulations banner */}
      {isAccepted && (
        <div style={{ textAlign: "center", padding: "14px 0", marginBottom: 14 }}>
          <div style={{ fontSize: 28 }}>🎓🎉</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#34D399", marginTop: 6 }}>Congratulations on your placement!</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
            Accepted on {offer.responded_at ? new Date(offer.responded_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </div>
        </div>
      )}

      {/* Declined note */}
      {isDeclined && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.12)", fontSize: 12, color: "#F87171", marginBottom: 14 }}>
          You declined this offer on{" "}
          {offer.responded_at ? new Date(offer.responded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}.
          This decision is final and cannot be reversed.
        </div>
      )}

      {/* Remarks */}
      {offer.remarks && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", fontSize: 12, color: "#94A3B8", marginBottom: 14 }}>
          <strong style={{ color: "#64748B" }}>Note: </strong>{offer.remarks}
        </div>
      )}

      {/* Action buttons */}
      {isPending && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onAction(offer.id, "decline")}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid rgba(239,68,68,.2)", background: "rgba(239,68,68,.08)", color: "#F87171", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all .18s" }}
          >
            Decline
          </button>
          <button
            onClick={() => onAction(offer.id, "accept")}
            style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "opacity .18s", boxShadow: "0 4px 14px rgba(16,185,129,.3)" }}
          >
            🎉 Accept Offer
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────── */
export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ offer: Offer; action: "accept" | "decline" } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sp } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!sp) { setLoading(false); return; }

      const { data } = await supabase
        .from("offers")
        .select(`
          id, offer_type, package_lpa, joining_date, offer_status, offered_at, responded_at, remarks,
          employer_profiles!inner(company_name, logo_url),
          applications!inner(
            jobs!inner(title, location, employment_type)
          )
        `)
        .eq("student_id", sp.id)
        .is("deleted_at", null)
        .order("offered_at", { ascending: false });

      if (data) setOffers(data as unknown as Offer[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleAction = async () => {
    if (!actionTarget) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/student/offers/${actionTarget.offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionTarget.action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      const newStatus: OfferStatus = actionTarget.action === "accept" ? "accepted" : "declined";
      setOffers((prev) => prev.map((o) => o.id === actionTarget.offer.id ? { ...o, offer_status: newStatus, responded_at: new Date().toISOString() } : o));
      showToast(actionTarget.action === "accept" ? "🎉 Offer accepted! Congratulations on your placement!" : "Offer declined.");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
    setProcessing(false);
    setActionTarget(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366F1", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const pending  = offers.filter((o) => o.offer_status === "issued");
  const accepted = offers.filter((o) => o.offer_status === "accepted");
  const past     = offers.filter((o) => !["issued", "accepted"].includes(o.offer_status));

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ padding: "28px 32px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white" }}>My Offers</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Review and respond to your placement offers.</p>
        </div>

        {offers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎁</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#64748B" }}>No offers yet</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Keep applying — your offer is on its way!</div>
            <div style={{ marginTop: 20 }}>
              <a href="/student/jobs" style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                Browse Jobs →
              </a>
            </div>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FCD34D", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  ⏳ Pending Response ({pending.length})
                </div>
                {pending.map((o) => (
                  <OfferCard key={o.id} offer={o} onAction={(id, action) => setActionTarget({ offer: offers.find((x) => x.id === id)!, action })} />
                ))}
              </div>
            )}

            {accepted.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#34D399", marginBottom: 12 }}>
                  ✓ Accepted ({accepted.length})
                </div>
                {accepted.map((o) => (
                  <OfferCard key={o.id} offer={o} onAction={() => {}} />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 12 }}>
                  Past Offers ({past.length})
                </div>
                {past.map((o) => (
                  <OfferCard key={o.id} offer={o} onAction={() => {}} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {actionTarget && (
        <ConfirmModal
          offer={actionTarget.offer}
          action={actionTarget.action}
          onConfirm={handleAction}
          onCancel={() => setActionTarget(null)}
          loading={processing}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, padding: "12px 20px", borderRadius: 12,
          fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          animation: "toast-in .25s ease",
          ...(toast.type === "ok"
            ? { background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.25)", color: "#34D399" }
            : { background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)", color: "#F87171" }),
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}
