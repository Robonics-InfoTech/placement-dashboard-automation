"use client";

import ResumeUploader from "./ResumeUploader";

export default function DocumentsPage() {
  return (
    <div className="space-y-8">

<ResumeUploader />

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-8">

        <h2 className="text-2xl font-semibold">
          Academic Marksheets
        </h2>

      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-8">

        <h2 className="text-2xl font-semibold">
          Certifications
        </h2>

      </div>

    </div>
  );
}