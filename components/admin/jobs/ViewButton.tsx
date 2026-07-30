"use client";

import { useState } from "react";
import JobDetailsModal from "./JobDetailsModal";

export default function ViewButton({
  job,
}: {
  job: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        View
      </button>

      {open && (
        <JobDetailsModal
          job={job}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}