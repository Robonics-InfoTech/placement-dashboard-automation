"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const IconClock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

type Job = {
  id: string;
  company_name: string;
  title: string;
  application_deadline: string;
};

export default function UpcomingDeadlines() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    loadDeadlines();
  }, []);

  async function loadDeadlines() {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("jobs")
      .select("id, company_name, title, application_deadline")
      .gte("application_deadline", today)
      .eq("status", "active")
      .order("application_deadline", { ascending: true })
      .limit(5);

    if (error) {
      console.error(error);
      return;
    }

    setJobs(data || []);
  }

  return (
    <div className="sd-card">
      <div className="sd-card-title">
        Upcoming Deadlines
      </div>

      {jobs.length === 0 ? (
        <p style={{ color: "#64748B" }}>
          No upcoming deadlines.
        </p>
      ) : (
        jobs.map((job) => (
          <div
            key={job.id}
            className="sd-upcoming-item"
          >
            <div className="sd-upcoming-company">
              {job.company_name}
            </div>

            <div className="sd-upcoming-type">
              {job.title}
            </div>

            <div className="sd-upcoming-time">
              <IconClock />
              {new Date(
                job.application_deadline
              ).toLocaleDateString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}