import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import StatusChip from "@/components/employer/StatusChip";

export default async function DrivesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, approval_status")
    .eq("user_id", user.id)
    .single();

  const { data: drives } = await supabase
    .from("drives")
    .select("id, name, drive_date, venue_type, venue, status, max_students, created_at")
    .eq("employer_id", profile?.id ?? "")
    .order("drive_date", { ascending: true });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const isApproved = profile?.approval_status === "approved";

  return (
    <>
      <style>{`
        .drv-topbar { padding: 22px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .drv-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .drv-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .drv-new-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer; text-decoration: none; background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white; font-size: 13px; font-weight: 600; transition: opacity .2s; }
        .drv-new-btn:hover { opacity: .88; }
        .drv-new-btn--disabled { opacity: .4; pointer-events: none; }
        .drv-content { padding: 28px 32px; }
        .drv-grid { display: flex; flex-direction: column; gap: 14px; }
        .drv-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 20px; display: flex; align-items: flex-start; gap: 18px;
          transition: transform .2s;
        }
        .drv-card:hover { transform: translateY(-2px); }
        .drv-icon {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg,#0EA5E9,#6366F1);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .drv-main { flex: 1; }
        .drv-name { font-size: 16px; font-weight: 700; color: white; margin-bottom: 6px; }
        .drv-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: #64748B; }
        .drv-meta span { display: flex; align-items: center; gap: 5px; }
        .drv-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .drv-act { padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; }
        .drv-act.inprog  { background: rgba(99,102,241,.15); color: #A78BFA; }
        .drv-act.complete { background: rgba(16,185,129,.12); color: #34D399; }
        .drv-act.cancel  { background: rgba(239,68,68,.12); color: #FCA5A5; }
        .drv-empty { padding: 60px; text-align: center; color: #475569; font-size: 14px; }
        .drv-empty a { color: #0EA5E9; text-decoration: none; }
      `}</style>

      <div className="drv-topbar">
        <div>
          <h2>Recruitment Drives</h2>
          <p>Schedule and manage campus recruitment events.</p>
        </div>
        <Link
          href="/employer/drives/new"
          className={`drv-new-btn${!isApproved ? " drv-new-btn--disabled" : ""}`}
        >
          + Schedule Drive
        </Link>
      </div>

      <div className="drv-content">
        <div className="drv-grid">
          {!drives || drives.length === 0 ? (
            <div className="drv-empty">
              No drives scheduled yet.{" "}
              {isApproved && <Link href="/employer/drives/new">Schedule your first drive →</Link>}
            </div>
          ) : (
            drives.map((drive) => (
              <div key={drive.id} className="drv-card">
                <div className="drv-icon">
                  {drive.venue_type === "virtual" ? "💻" : "🏢"}
                </div>
                <div className="drv-main">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div className="drv-name">{drive.name}</div>
                    <StatusChip status={drive.status} size="sm" />
                  </div>
                  <div className="drv-meta">
                    <span>📅 {fmt(drive.drive_date)}</span>
                    <span>📍 {drive.venue_type === "virtual" ? "Virtual" : drive.venue}</span>
                    {drive.max_students && <span>👥 Max {drive.max_students} students</span>}
                  </div>

                  {/* Status transition buttons */}
                  <div className="drv-actions">
                    {drive.status === "scheduled" && (
                      <DriveStatusBtn driveId={drive.id} newStatus="in_progress" className="inprog">
                        Mark In Progress
                      </DriveStatusBtn>
                    )}
                    {drive.status === "in_progress" && (
                      <>
                        <DriveStatusBtn driveId={drive.id} newStatus="completed" className="complete">
                          Mark Completed
                        </DriveStatusBtn>
                        <DriveStatusBtn driveId={drive.id} newStatus="cancelled" className="cancel">
                          Cancel Drive
                        </DriveStatusBtn>
                      </>
                    )}
                    {drive.status === "scheduled" && (
                      <DriveStatusBtn driveId={drive.id} newStatus="cancelled" className="cancel">
                        Cancel
                      </DriveStatusBtn>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// Client component for status buttons (needs onClick)
function DriveStatusBtn({
  driveId, newStatus, className, children,
}: {
  driveId: string; newStatus: string; className: string; children: React.ReactNode;
}) {
  const update = async () => {
    await fetch(`/api/employer/drives/${driveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    window.location.reload();
  };
  return (
    <button className={`drv-act ${className}`} onClick={update}>
      {children}
    </button>
  );
}
