"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";
import { getMyApplications } from "@/lib/student/applications";
import { getStudentProfile } from "@/lib/student/jobs";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const student = await getStudentProfile(user.id);

      const data = await getMyApplications(student.id);

      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">
            No Applications Yet
          </h2>

          <p className="mt-3 text-slate-400">
            You haven't applied to any placement opportunities yet.
          </p>

          <Link
            href="/student/jobs"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium text-white"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        applications.map((application) => (
          <div
            key={application.id}
            className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {application.jobs?.title}
                </h2>

                <p className="mt-1 text-slate-400">
                  {application.jobs?.company_name}
                </p>
              </div>

              <span className="rounded-full bg-indigo-600/20 px-4 py-2 text-indigo-300">
                {application.application_status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">
                  Applied On
                </p>

                <p>
                  {new Date(
                    application.applied_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Remarks
                </p>

                <p>
                  {application.remarks ?? "No remarks"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href={`/student/jobs/${application.job_id}`}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium text-white"
              >
                View Job
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}