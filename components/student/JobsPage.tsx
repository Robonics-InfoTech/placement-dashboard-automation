"use client";

import { useEffect, useState } from "react";
import {
  getPublishedJobs,
  getStudentProfile,
} from "@/lib/student/jobs";

import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function JobsPage() {
const [jobs, setJobs] = useState<any[]>([]);
const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const [search, setSearch] = useState("");
const [locationFilter, setLocationFilter] = useState("");
const [jobTypeFilter, setJobTypeFilter] = useState("");
const [employmentFilter, setEmploymentFilter] = useState("");

const [sortBy, setSortBy] = useState("deadline");
const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadJobs();
  }, []);

async function loadJobs() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const [jobsData, profileData] = await Promise.all([
      getPublishedJobs(),
      getStudentProfile(user.id),
    ]);

    setJobs(jobsData);
    setFilteredJobs(jobsData);
    setProfile(profileData);
  } finally {
    setLoading(false);
  }
}

function isEligible(job: any) {
  if (!profile) return false;

  const cgpa =
    Number(profile.cgpa) >= Number(job.minimum_cgpa);

  const backlogs =
    profile.active_backlogs <= job.maximum_backlogs;

  const branch =
    job.eligible_branches?.includes(profile.branch);

  const graduation =
    job.eligible_graduation_years?.includes(
      profile.graduation_year
    );

  return cgpa && backlogs && branch && graduation;
}

useEffect(() => {
  let filtered = [...jobs];

  if (search) {
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company_name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (locationFilter) {
    filtered = filtered.filter((job) =>
      job.location
        .toLowerCase()
        .includes(locationFilter.toLowerCase())
    );
  }

  if (jobTypeFilter) {
    filtered = filtered.filter(
      (job) => job.job_type === jobTypeFilter
    );
  }

  if (employmentFilter) {
    filtered = filtered.filter(
      (job) => job.employment_type === employmentFilter
    );
  }

  if (sortBy === "salary") {
  filtered.sort(
    (a, b) =>
      Number(b.salary_package) - Number(a.salary_package)
  );
}

if (sortBy === "deadline") {
  filtered.sort(
    (a, b) =>
      new Date(a.application_deadline).getTime() -
      new Date(b.application_deadline).getTime()
  );
}

if (sortBy === "latest") {
  filtered.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
}

  setFilteredJobs(filtered);
}, [
  jobs,
  search,
  locationFilter,
  jobTypeFilter,
  employmentFilter,
  sortBy,
]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-10 text-center">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">

  <div className="grid gap-4 md:grid-cols-5">

    <input
      type="text"
      placeholder="Search by title or company..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500"
    />

    <input
      type="text"
      placeholder="Location"
      value={locationFilter}
      onChange={(e) => setLocationFilter(e.target.value)}
      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500"
    />

    <select
      value={jobTypeFilter}
      onChange={(e) => setJobTypeFilter(e.target.value)}
      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
    >
      <option value="">All Job Types</option>
      <option value="placement">Placement</option>
      <option value="internship">Internship</option>
    </select>

    <select
      value={employmentFilter}
      onChange={(e) => setEmploymentFilter(e.target.value)}
      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
    >
      <option value="">All Employment Types</option>
      <option value="full_time">Full Time</option>
      <option value="part_time">Part Time</option>
      <option value="internship">Internship</option>
    </select>

<select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
>
  <option value="deadline">Deadline</option>
  <option value="salary">Salary</option>
  <option value="latest">Latest</option>
</select>

  </div>

</div>
{filteredJobs.map((job) => (
  <div
    key={job.id}
    className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6"
  >
    <div className="flex items-start justify-between">

      <div>
        <h2 className="text-2xl font-semibold">
          {job.title}
        </h2>

        <p className="mt-1 text-slate-400">
          {job.company_name}
        </p>
      </div>

      <div className="flex flex-col items-end gap-3">

        <span className="rounded-full bg-indigo-600/20 px-4 py-2 text-indigo-300">
          {job.job_type}
        </span>

        {isEligible(job) ? (
          <span className="rounded-full bg-green-600/20 px-4 py-2 text-sm font-medium text-green-400">
            ✅ Eligible
          </span>
        ) : (
          <span className="rounded-full bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400">
            ❌ Not Eligible
          </span>
        )}

      </div>

    </div>

    <p className="mt-5 text-slate-300">
      {job.description}
    </p>

    <div className="mt-6 grid gap-4 md:grid-cols-4">

      <div>
        <p className="text-sm text-slate-500">
          Location
        </p>

        <p>{job.location}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Package
        </p>

        <p>
          ₹{Number(job.salary_package).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Minimum CGPA
        </p>

        <p>{job.minimum_cgpa}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Deadline
        </p>

        <p>{job.application_deadline}</p>
      </div>

    </div>

    <div className="mt-6 flex justify-end">

<Link
  href={`/student/jobs/${job.id}`}
  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium transition hover:opacity-90"
>
  View Details
</Link>

    </div>

  </div>
))}    </div>
  );
}