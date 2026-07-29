"use client";

import { useTransition } from "react";
import { rejectEmployer } from "@/app/admin/employers/actions";

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
        if (!confirm("Reject this employer?")) return;

        startTransition(async () => {
          await rejectEmployer(id);
        });
      }}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
    >
      Reject
    </button>
  );
}