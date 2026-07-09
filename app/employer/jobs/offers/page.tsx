"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatusChip from "@/components/employer/StatusChip";

interface Offer {
  id: string;
  role_confirmed: string;
  ctc: number;
  joining_date: string;
  location: string;
  status: "pending" | "accepted" | "declined";
  published_at: string;
  offer_letter_path: string | null;
  student_profiles: { full_name: string | null; branch: string; enrollment_number: string } | null;
}

export default function OffersPage() {
  const [offers, setOffers]   = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/employer/offers");
      if (res.ok) {
        const json = await res.json();
        setOffers(json.data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const stats = {
    total:    offers.length,
    pending:  offers.filter((o) => o.status === "pending").length,
    accepted: offers.filter((o) => o.status === "accepted").length,
    declined: offers.filter((o) => o.status === "declined").length,
  };

  return (
    <>
      <style>{`
        .op-topbar { padding: 22px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .op-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .op-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .op-new-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer; text-decoration: none; background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white; font-size: 13px; font-weight: 600; transition: opacity .2s; }
        .op-new-btn:hover { opacity: .88; }
        .op-content { padding: 28px 32px; }

        .op-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
        .op-stat { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 18px; }
        .op-stat-val { font-size: 28px; font-weight: 800; color: white; }
        .op-stat-lbl { font-size: 12px; color: #64748B; margin-top: 4px; }

        .op-table-wrap { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; overflow: hidden; }
        .op-table { width: 100%; border-collapse: collapse; }
        .op-th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .op-td { padding: 14px 16px; font-size: 13px; color: #CBD5E1; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
        .op-tr:last-child .op-td { border-bottom: none; }
        .op-tr:hover .op-td { background: rgba(255,255,255,.02); }
        .op-name { font-weight: 600; color: white; }
        .op-empty { padding: 50px; text-align: center; color: #475569; font-size: 14px; }
        .op-letter-link { color: #38BDF8; text-decoration: none; font-size: 12px; font-weight: 600; }
        .op-letter-link:hover { opacity: .8; }
        @media(max-width:900px){ .op-stats { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="op-topbar">
        <div>
          <h2>Offers</h2>
          <p>Track all offer letters published to students.</p>
        </div>
        <Link href="/employer/jobs/offers/new" className="op-new-btn">
          + Publish Offer
        </Link>
      </div>

      <div className="op-content">
        {/* Stats */}
        <div className="op-stats">
          {[
            { label: "Total Offers",  value: stats.total,    color: "#0EA5E9" },
            { label: "Pending",       value: stats.pending,  color: "#F59E0B" },
            { label: "Accepted",      value: stats.accepted, color: "#10B981" },
            { label: "Declined",      value: stats.declined, color: "#EF4444" },
          ].map((s) => (
            <div className="op-stat" key={s.label}>
              <div className="op-stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="op-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="op-table-wrap">
          <table className="op-table">
            <thead>
              <tr>
                {["Student", "Branch", "Role", "CTC (LPA)", "Joining Date", "Location", "Offer Letter", "Status"].map((h) => (
                  <th key={h} className="op-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="op-td">
                        <div style={{ height: 14, background: "rgba(255,255,255,.06)", borderRadius: 6 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="op-empty">
                    No offers published yet.{" "}
                    <Link href="/employer/jobs/offers/new" style={{ color: "#0EA5E9", textDecoration: "none" }}>
                      Publish your first offer →
                    </Link>
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="op-tr">
                    <td className="op-td">
                      <div className="op-name">{offer.student_profiles?.full_name ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{offer.student_profiles?.enrollment_number}</div>
                    </td>
                    <td className="op-td">{offer.student_profiles?.branch ?? "—"}</td>
                    <td className="op-td" style={{ fontWeight: 600 }}>{offer.role_confirmed}</td>
                    <td className="op-td">{offer.ctc.toFixed(1)}</td>
                    <td className="op-td">{fmt(offer.joining_date)}</td>
                    <td className="op-td">{offer.location}</td>
                    <td className="op-td">
                      {offer.offer_letter_path ? (
                        <a
                          href={`/api/employer/offers/download?path=${encodeURIComponent(offer.offer_letter_path)}`}
                          className="op-letter-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          ↓ Download PDF
                        </a>
                      ) : (
                        <span style={{ color: "#475569", fontSize: 12 }}>Not uploaded</span>
                      )}
                    </td>
                    <td className="op-td"><StatusChip status={offer.status} size="sm" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
