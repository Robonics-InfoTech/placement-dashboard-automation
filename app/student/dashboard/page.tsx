"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const IconBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconTrend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconGift = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const IconAlertCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─── Types ──────────────────────────────────────────────────────────────── */
type PlacementStats = { applied: number; shortlisted: number; offers: number };
type DriveEvent = { id: string; drive_name: string; drive_date: string; employer_id: string; status: string; venue: string | null };
type ProfileData = { cgpa: number | null; branch: string; graduation_year: number | null; active_backlogs: number; placement_status: string; skills?: string[]; resume_url?: string | null };
type PendingOffer = { id: string; package_lpa: number | null; joining_date: string | null; jobs: { title: string } | null; employer_profiles: { company_name: string } | null };

/* ─── Profile completion calculator ─────────────────────────────────────── */
function calcCompletion(profile: ProfileData | null, hasResume: boolean, hasPhoto: boolean): { pct: number; items: Array<{ label: string; done: boolean }> } {
  const items = [
    { label: "Personal info filled", done: !!(profile?.branch && profile?.graduation_year) },
    { label: "CGPA entered",         done: !!(profile?.cgpa) },
    { label: "Resume uploaded",      done: hasResume },
    { label: "Profile photo set",    done: hasPhoto },
    { label: "Skills added",         done: !!(profile?.skills && profile.skills.length > 0) },
  ];
  const done = items.filter((i) => i.done).length;
  return { pct: Math.round((done / items.length) * 100), items };
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<PlacementStats>({ applied: 0, shortlisted: 0, offers: 0 });
  const [drives, setDrives] = useState<DriveEvent[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pendingOffer, setPendingOffer] = useState<PendingOffer | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get public users row
      const { data: publicUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!publicUser) { setLoading(false); return; }

      // Get student profile
      const { data: sp } = await supabase
        .from("student_profiles")
        .select("id, cgpa, branch, graduation_year, active_backlogs, placement_status, resume_url, skills")
        .eq("user_id", publicUser.id)
        .single();

      if (sp) {
        setProfile(sp);
        setStudentProfileId(sp.id);
        setHasResume(!!sp.resume_url);

        // Check if profile photo exists in documents
        const { data: photoDocs } = await supabase
          .from("documents")
          .select("id")
          .eq("user_id", publicUser.id)
          .eq("document_type", "photo")
          .is("deleted_at", null)
          .limit(1);
        setHasPhoto(!!(photoDocs && photoDocs.length > 0));

        // Get application stats
        const { data: apps } = await supabase
          .from("applications")
          .select("application_status")
          .eq("student_id", sp.id)
          .is("deleted_at", null);

        if (apps) {
          setStats({
            applied: apps.length,
            shortlisted: apps.filter((a) => ["shortlisted", "assessment", "interview", "selected"].includes(a.application_status)).length,
            offers: apps.filter((a) => a.application_status === "selected").length,
          });
        }

        // Get pending offer
        const { data: offer } = await supabase
          .from("offers")
          .select("id, package_lpa, joining_date, application_id, applications!inner(job_id, jobs!inner(title)), employer_profiles!inner(company_name)")
          .eq("student_id", sp.id)
          .eq("offer_status", "issued")
          .is("deleted_at", null)
          .limit(1)
          .maybeSingle();

        if (offer) {
          setPendingOffer({
            id: offer.id,
            package_lpa: offer.package_lpa,
            joining_date: offer.joining_date,
            jobs: (offer as unknown as { applications: { jobs: { title: string } } }).applications?.jobs ?? null,
            employer_profiles: offer.employer_profiles as { company_name: string } ?? null,
          });
        }
      }

      // Get upcoming drives (next 5)
      const { data: driveData } = await supabase
        .from("placement_drives")
        .select("id, drive_name, drive_date, employer_id, status, venue")
        .gte("drive_date", new Date().toISOString().split("T")[0])
        .eq("status", "scheduled")
        .is("deleted_at", null)
        .order("drive_date", { ascending: true })
        .limit(5);

      if (driveData) setDrives(driveData);

      setLoading(false);
    };
    init();
  }, []);

  const { pct, items: completionItems } = calcCompletion(profile, hasResume, hasPhoto);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const daysUntil = (d: string) => {
    const diff = new Date(d).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366F1", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sdb-wrap { padding: 28px 32px; max-width: 1280px; margin: 0 auto; }

        /* ── Offer banner ── */
        .sdb-offer-banner {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-radius: 14px; margin-bottom: 24px;
          background: linear-gradient(135deg, rgba(16,185,129,.12), rgba(5,150,105,.06));
          border: 1px solid rgba(16,185,129,.25);
          animation: sdb-slide-in .4s ease;
        }
        @keyframes sdb-slide-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .sdb-offer-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(16,185,129,.15); display: flex; align-items: center; justify-content: center; color: #34D399; flex-shrink: 0; }
        .sdb-offer-text { flex: 1; }
        .sdb-offer-title { font-size: 14px; font-weight: 700; color: #34D399; }
        .sdb-offer-sub   { font-size: 12px; color: #94A3B8; margin-top: 2px; }
        .sdb-offer-btn {
          padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#10B981,#059669); color: white;
          font-size: 12px; font-weight: 700; white-space: nowrap;
          transition: opacity .2s;
        }
        .sdb-offer-btn:hover { opacity: .88; }

        /* ── Stat cards ── */
        .sdb-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
        .sdb-stat {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; transition: transform .2s, border-color .2s;
          position: relative; overflow: hidden;
        }
        .sdb-stat::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent);
        }
        .sdb-stat:hover { transform: translateY(-3px); border-color: rgba(255,255,255,.12); }
        .sdb-stat-icon {
          width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 14px; color: var(--accent);
          background: color-mix(in srgb, var(--accent) 12%, transparent);
        }
        .sdb-stat-val  { font-size: 32px; font-weight: 800; color: white; }
        .sdb-stat-lbl  { font-size: 12px; color: #64748B; font-weight: 500; margin-top: 3px; }
        .sdb-stat-delta { margin-top: 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; color: #10B981; }

        /* ── Bottom grid ── */
        .sdb-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }

        /* ── Card ── */
        .sdb-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 22px;
        }
        .sdb-card-title {
          font-size: 14px; font-weight: 700; color: white; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sdb-card-link { font-size: 11.5px; color: #818CF8; text-decoration: none; font-weight: 600; }
        .sdb-card-link:hover { color: #A5B4FC; }

        /* ── Drive events ── */
        .sdb-drive-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px; border-radius: 10px; margin-bottom: 8px;
          background: rgba(99,102,241,.06); border: 1px solid rgba(99,102,241,.12);
          transition: border-color .2s;
        }
        .sdb-drive-item:hover { border-color: rgba(99,102,241,.25); }
        .sdb-drive-date-box {
          display: flex; flex-direction: column; align-items: center;
          width: 44px; flex-shrink: 0; border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(99,102,241,.2);
        }
        .sdb-drive-month { background: #6366F1; color: white; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 3px 0; width: 100%; text-align: center; }
        .sdb-drive-day   { font-size: 18px; font-weight: 800; color: white; padding: 4px 0; text-align: center; background: rgba(99,102,241,.1); width: 100%; }
        .sdb-drive-info  { flex: 1; }
        .sdb-drive-name  { font-size: 13px; font-weight: 600; color: #E2E8F0; }
        .sdb-drive-meta  { font-size: 11px; color: #64748B; margin-top: 3px; display: flex; gap: 8px; align-items: center; }
        .sdb-drive-chip  { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .sdb-drive-chip.soon { background: rgba(245,158,11,.12); color: #FCD34D; }
        .sdb-drive-chip.later { background: rgba(100,116,139,.1); color: #94A3B8; }

        /* ── Quick actions ── */
        .sdb-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .sdb-action {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-radius: 12px; text-decoration: none;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          transition: all .18s;
        }
        .sdb-action:hover { background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.2); transform: translateX(3px); }
        .sdb-action-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sdb-action-text { flex: 1; }
        .sdb-action-label { font-size: 13px; font-weight: 600; color: #E2E8F0; }
        .sdb-action-sub   { font-size: 11px; color: #64748B; margin-top: 1px; }
        .sdb-action-arrow { color: #475569; }

        /* ── Profile completion ── */
        .sdb-prog-wrap { background: rgba(255,255,255,.06); border-radius: 20px; height: 8px; margin: 10px 0 16px; overflow: hidden; }
        .sdb-prog-fill { height: 100%; border-radius: 20px; background: linear-gradient(90deg,#6366F1,#06B6D4); transition: width .8s ease; }
        .sdb-prog-item { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 4px 0; }
        .sdb-prog-dot  { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 9px; }
        .sdb-prog-dot.done { background: rgba(16,185,129,.15); color: #34D399; }
        .sdb-prog-dot.todo { background: rgba(245,158,11,.12); color: #FCD34D; }

        @media (max-width: 1100px) { .sdb-grid { grid-template-columns: 1fr; } }
        @media (max-width: 700px)  { .sdb-stats { grid-template-columns: 1fr 1fr; } .sdb-wrap { padding: 16px; } }
      `}</style>

      <div className="sdb-wrap">
        {/* ── Offer Banner ── */}
        {pendingOffer && (
          <div className="sdb-offer-banner">
            <div className="sdb-offer-icon"><IconGift /></div>
            <div className="sdb-offer-text">
              <div className="sdb-offer-title">
                🎉 You have a pending offer from {pendingOffer.employer_profiles?.company_name ?? "an employer"}!
              </div>
              <div className="sdb-offer-sub">
                {pendingOffer.jobs?.title} · {pendingOffer.package_lpa ? `₹${pendingOffer.package_lpa} LPA` : "CTC not specified"}
                {pendingOffer.joining_date ? ` · Join by ${formatDate(pendingOffer.joining_date)}` : ""}
              </div>
            </div>
            <a href="/student/offers" className="sdb-offer-btn">View Offer</a>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="sdb-stats">
          {[
            { label: "Applications Sent",  value: stats.applied,     icon: <IconBriefcase />, accent: "#6366F1", delta: "Total applied" },
            { label: "Shortlisted",         value: stats.shortlisted, icon: <IconStar />,      accent: "#F59E0B", delta: "Active pipeline" },
            { label: "Offers Received",     value: stats.offers,      icon: <IconCheck />,     accent: "#10B981", delta: stats.offers > 0 ? "🎉 Congrats!" : "Keep applying" },
          ].map((s) => (
            <div className="sdb-stat" key={s.label} style={{ "--accent": s.accent } as React.CSSProperties}>
              <div className="sdb-stat-icon">{s.icon}</div>
              <div className="sdb-stat-val">{s.value}</div>
              <div className="sdb-stat-lbl">{s.label}</div>
              <div className="sdb-stat-delta"><IconTrend />{s.delta}</div>
            </div>
          ))}
        </div>

        {/* ── Bottom grid ── */}
        <div className="sdb-grid">
          {/* Left: Drive Calendar */}
          <div className="sdb-card">
            <div className="sdb-card-title">
              Upcoming Placement Drives
              <a href="/student/jobs" className="sdb-card-link">Browse Jobs →</a>
            </div>

            {drives.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#475569", fontSize: 13 }}>
                <IconCalendar />
                <div style={{ marginTop: 10 }}>No upcoming drives scheduled</div>
              </div>
            ) : (
              drives.map((d) => {
                const dDate = new Date(d.drive_date);
                const month = dDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
                const day = dDate.getDate();
                const days = daysUntil(d.drive_date);
                return (
                  <div className="sdb-drive-item" key={d.id}>
                    <div className="sdb-drive-date-box">
                      <div className="sdb-drive-month">{month}</div>
                      <div className="sdb-drive-day">{day}</div>
                    </div>
                    <div className="sdb-drive-info">
                      <div className="sdb-drive-name">{d.drive_name}</div>
                      <div className="sdb-drive-meta">
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconClock />{formatDate(d.drive_date)}</span>
                        {d.venue && <span>· {d.venue}</span>}
                      </div>
                    </div>
                    <span className={`sdb-drive-chip ${days <= 3 ? "soon" : "later"}`}>
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quick Actions */}
            <div className="sdb-card">
              <div className="sdb-card-title">Quick Actions</div>
              <div className="sdb-actions">
                {[
                  { href: "/student/profile",      label: "Update Profile",     sub: "Keep your info current",   icon: "👤", bg: "rgba(99,102,241,.12)" },
                  { href: "/student/jobs",         label: "Browse Jobs",        sub: "Find eligible openings",   icon: "💼", bg: "rgba(139,92,246,.12)" },
                  { href: "/student/applications", label: "Track Applications", sub: "Check your pipeline",      icon: "📋", bg: "rgba(6,182,212,.12)" },
                  { href: "/student/documents",    label: "Upload Documents",   sub: "Resume, marksheets & more", icon: "📄", bg: "rgba(16,185,129,.12)" },
                ].map((a) => (
                  <a key={a.href} href={a.href} className="sdb-action">
                    <div className="sdb-action-icon" style={{ background: a.bg, fontSize: 17 }}>{a.icon}</div>
                    <div className="sdb-action-text">
                      <div className="sdb-action-label">{a.label}</div>
                      <div className="sdb-action-sub">{a.sub}</div>
                    </div>
                    <div className="sdb-action-arrow"><IconArrow /></div>
                  </a>
                ))}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="sdb-card">
              <div className="sdb-card-title">Profile Strength</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "white" }}>{pct}%</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>complete</span>
              </div>
              <div className="sdb-prog-wrap">
                <div className="sdb-prog-fill" style={{ width: `${pct}%` }} />
              </div>
              {completionItems.map((item) => (
                <div className="sdb-prog-item" key={item.label} style={{ color: item.done ? "#34D399" : "#F59E0B" }}>
                  <div className={`sdb-prog-dot ${item.done ? "done" : "todo"}`}>
                    {item.done ? "✓" : "!"}
                  </div>
                  {item.label}
                </div>
              ))}
              {pct < 100 && (
                <a href="/student/profile" style={{ display: "block", marginTop: 12, textAlign: "center", fontSize: 12, color: "#818CF8", fontWeight: 600, textDecoration: "none" }}>
                  Complete your profile →
                </a>
              )}
            </div>

            {/* Status badge */}
            {profile && (
              <div className="sdb-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Placement Status</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 18px", borderRadius: 20, fontSize: 14, fontWeight: 700,
                  background: profile.placement_status === "placed" ? "rgba(16,185,129,.12)" : "rgba(99,102,241,.12)",
                  color: profile.placement_status === "placed" ? "#34D399" : "#A5B4FC",
                  border: `1px solid ${profile.placement_status === "placed" ? "rgba(16,185,129,.25)" : "rgba(99,102,241,.2)"}`,
                }}>
                  {profile.placement_status === "placed" ? "🎓 Placed" : profile.placement_status === "eligible" ? "✅ Eligible" : "⏳ " + profile.placement_status}
                </div>
                {profile.placement_status !== "placed" && profile.cgpa && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#64748B" }}>
                    CGPA: <strong style={{ color: "#A5B4FC" }}>{profile.cgpa}</strong>
                    {profile.active_backlogs > 0 && <span> · {profile.active_backlogs} active backlogs</span>}
                  </div>
                )}
              </div>
            )}

            {!profile && (
              <div className="sdb-card" style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ color: "#F59E0B", marginBottom: 8 }}><IconAlertCircle /></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 6 }}>Profile Not Set Up</div>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Complete your profile to start applying</div>
                <a href="/student/profile" style={{ display: "inline-block", padding: "8px 20px", borderRadius: 8, background: "rgba(99,102,241,.15)", color: "#A5B4FC", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(99,102,241,.2)" }}>
                  Set Up Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}