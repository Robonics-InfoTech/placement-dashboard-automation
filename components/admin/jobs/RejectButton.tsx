"use client";

import { useTransition } from "react";
import { rejectJob } from "@/app/admin/jobs/actions";

export default function RejectButton({
  id,
}: {
  id: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Reject this job?")) return;

        startTransition(async () => {
          await rejectJob(id);
        });
      }}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
    >
      Reject
    </button>
  );
}