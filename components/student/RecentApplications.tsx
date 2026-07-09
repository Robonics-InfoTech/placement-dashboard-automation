"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Application = {
  id: string;
  application_status: string;
  applied_at: string;
  jobs: {
    title: string;
    location: string;
  }[];
};

export default function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        application_status,
        applied_at,
        jobs (
          title,
          location
        )
      `)
      .eq("student_id", user.id)
      .order("applied_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(error);
    } else {
      setApplications((data as Application[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="sd-card">
        <div className="sd-card-title">Recent Applications</div>
        <p style={{ color: "#64748B" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="sd-card">
      <div className="sd-card-title">
        Recent Applications
      </div>

      {applications.length === 0 ? (
        <p style={{ color: "#64748B" }}>
          No applications yet.
        </p>
      ) : (
        applications.map((application) => (
          <div
            key={application.id}
            className="sd-activity-item"
          >
            <div
              className="sd-co-logo"
              style={{ background: "#6366F1" }}
            >
              {application.jobs?.[0]?.title?.[0] ?? "J"}
            </div>

            <div className="sd-activity-info">
              <div className="sd-activity-company">
                {application.jobs?.[0]?.title ?? "Unknown Job"}
              </div>

              <div className="sd-activity-role">
                {application.jobs?.[0]?.location ?? ""}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                className={`sd-status-chip ${application.application_status.toLowerCase()}`}
              >
                {application.application_status}
              </div>

              <div className="sd-activity-time">
                {new Date(
                  application.applied_at
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}