"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Target, MapPin, Calendar, Users, IndianRupee, Search } from "lucide-react";

export default function BrowseDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("placement_drives")
        .select(`*, companies:employer_profiles(company_name, industry, logo_url)`)
        .gte("drive_date", today)
        .eq("status", "scheduled")
        .order("drive_date")
        .limit(50);
      setDrives(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = drives.filter(d =>
    !search ||
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.companies?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="Browse Drives" description="Placement drives open for your batch. Apply before the deadline." />

      {/* Search */}
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ position: "relative", maxWidth: 380 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company or drive name…"
            style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-md)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>

      <div style={{ padding: "16px 28px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          [1,2,3].map(i => <Card key={i}><div style={{ height: 80, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>)
        ) : filtered.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Target size={40} style={{ color: "var(--text-muted)", margin: "0 auto 14px", display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                {search ? "No drives match your search" : "No upcoming drives"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {search ? "Try a different search term." : "New drives will appear here when your college adds them."}
              </p>
            </div>
          </Card>
        ) : (
          filtered.map(drive => (
            <Card key={drive.id} hover>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {drive.title ?? drive.companies?.company_name ?? "Placement Drive"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                    {drive.companies?.company_name} {drive.companies?.industry ? `· ${drive.companies.industry}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {drive.drive_date && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                        <Calendar size={13} />
                        {new Date(drive.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                    {drive.venue && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                        <MapPin size={13} />
                        {drive.venue}
                      </span>
                    )}
                    {drive.max_students && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                        <Users size={13} />
                        {drive.max_students} seats
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--success-light)", color: "var(--success-text)" }}>
                    Open
                  </span>
                  <button style={{ padding: "7px 16px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Apply Now
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
