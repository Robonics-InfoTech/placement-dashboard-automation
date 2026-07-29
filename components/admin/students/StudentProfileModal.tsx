"use client";

import { Student } from "@/lib/admin/students";

interface Props {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

export default function StudentProfileModal({
  student,
  open,
  onClose,
}: Props) {
  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white">
            Student Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">

          <Info label="Full Name" value={student.full_name} />
          <Info label="Enrollment" value={student.enrollment_number} />
          <Info label="Course" value={student.course} />
          <Info label="Branch" value={student.branch} />
          <Info label="Semester" value={String(student.semester ?? "-")} />
          <Info label="CGPA" value={String(student.cgpa ?? "-")} />
          <Info label="Placement" value={student.placement_status} />
          <Info
            label="Verified"
            value={student.is_verified ? "Yes" : "No"}
          />
          <Info
            label="Suspended"
            value={student.is_suspended ? "Yes" : "No"}
          />
          <Info label="Phone" value={student.phone} />
          <Info label="LinkedIn" value={student.linkedin_url} />
          <Info label="GitHub" value={student.github_url} />
          <Info label="Portfolio" value={student.portfolio_url} />
          <Info label="Resume" value={student.resume_url} />

        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-white break-all">
        {value || "-"}
      </p>
    </div>
  );
}