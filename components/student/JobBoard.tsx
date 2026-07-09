"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function JobBoard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setJobs(data ?? []);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="p-8 text-white">Loading jobs...</div>;
  }

  return (
    <main className="min-h-screen bg-[#0B1020] text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Job Board
      </h1>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-semibold">
              {job.title}
            </h2>

            <p className="mt-1 text-slate-400">
              {job.company_name}
            </p>

            <div className="mt-4 flex gap-6 text-sm text-slate-300">
              <span>📍 {job.location}</span>
              <span>💰 {job.salary_package} {job.currency}</span>
              <span>🎓 CGPA {job.minimum_cgpa}+</span>
            </div>

            <button
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}