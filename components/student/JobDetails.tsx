"use client";

import { useEffect, useState } from "react";
import { getJobById, getStudentProfile } from "@/lib/student/jobs";
import {
  applyToJob,
  hasApplied,
} from "@/lib/student/applications";
import { supabase } from "@/lib/supabase/client";

type Props = {
  jobId: string;
};

export default function JobDetails({ jobId }: Props) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState<any>(null);
const [applied, setApplied] = useState(false);

  useEffect(() => {
    loadJob();
  }, []);

async function loadJob() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const [jobData, studentProfile] = await Promise.all([
      getJobById(jobId),
      getStudentProfile(user.id),
    ]);

    setJob(jobData);
    setStudent(studentProfile);

    const alreadyApplied = await hasApplied(
      studentProfile.id,
      jobId
    );

    setApplied(alreadyApplied);
  } finally {
    setLoading(false);
  }
}

async function handleApply() {
  if (!student || !job) return;

  try {
    await applyToJob({
      studentId: student.id,
      jobId: job.id,
      driveId: job.drive_id,
    });

    setApplied(true);

    alert("Application submitted successfully!");
  } catch (error) {
    console.error(error);
    alert("Failed to submit application.");
  }
}

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-red-700 bg-red-900/20 p-8 text-center text-red-400">
        Job not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">
              {job.title}
            </h1>

            <p className="mt-2 text-lg text-slate-400">
              {job.company_name}
            </p>

          </div>

          <span className="rounded-full bg-indigo-600/20 px-5 py-2 text-indigo-300">
            {job.job_type}
          </span>

        </div>

      </div>

      {/* Description */}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">

        <h2 className="mb-4 text-2xl font-semibold">
          Job Description
        </h2>

        <p className="leading-8 text-slate-300">
          {job.description}
        </p>

      </div>

      {/* Details */}

      <div className="grid gap-6 md:grid-cols-2">

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            Job Information
          </h3>

          <div className="space-y-3">

            <p>
              <span className="text-slate-400">Company:</span>{" "}
              {job.company_name}
            </p>

            <p>
              <span className="text-slate-400">Location:</span>{" "}
              {job.location}
            </p>

            <p>
              <span className="text-slate-400">Package:</span>{" "}
              ₹{Number(job.salary_package).toLocaleString()}
            </p>

            <p>
              <span className="text-slate-400">Employment:</span>{" "}
              {job.employment_type}
            </p>

            <p>
              <span className="text-slate-400">Deadline:</span>{" "}
              {job.application_deadline}
            </p>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            Eligibility
          </h3>

          <div className="space-y-3">

            <p>
              <span className="text-slate-400">Minimum CGPA:</span>{" "}
              {job.minimum_cgpa}
            </p>

            <p>
              <span className="text-slate-400">Maximum Backlogs:</span>{" "}
              {job.maximum_backlogs}
            </p>

            <p>
              <span className="text-slate-400">Eligible Branches:</span>{" "}
              {job.eligible_branches?.join(", ")}
            </p>

            <p>
              <span className="text-slate-400">Graduation Year:</span>{" "}
              {job.eligible_graduation_years?.join(", ")}
            </p>

          </div>

        </div>

      </div>

      {/* Skills */}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">

        <h2 className="mb-4 text-2xl font-semibold">
          Required Skills
        </h2>

        <div className="flex flex-wrap gap-3">

          {job.required_skills?.map((skill: string) => (
            <span
              key={skill}
              className="rounded-full bg-indigo-600/20 px-4 py-2 text-indigo-300"
            >
              {skill}
            </span>
          ))}

        </div>

      </div>

      {/* Documents */}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">

        <h2 className="mb-4 text-2xl font-semibold">
          Required Documents
        </h2>

        <ul className="list-disc space-y-2 pl-6 text-slate-300">

          {job.required_documents?.map((doc: string) => (
            <li key={doc}>{doc}</li>
          ))}

        </ul>

      </div>

      {/* Instructions */}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">

        <h2 className="mb-4 text-2xl font-semibold">
          Instructions
        </h2>

        <p className="text-slate-300">
          {job.application_instructions}
        </p>

      </div>

      {/* Apply */}

      <div className="flex justify-end">

<button
  disabled={applied}
  onClick={handleApply}
  className={`rounded-xl px-8 py-4 font-semibold transition ${
    applied
      ? "cursor-not-allowed bg-green-600"
      : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
  }`}
>
  {applied ? "Applied ✓" : "Apply Now"}
</button>

      </div>

    </div>
  );
}