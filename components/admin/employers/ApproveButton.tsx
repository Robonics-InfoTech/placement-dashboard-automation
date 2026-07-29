"use client";

import { useTransition } from "react";
import { approveEmployer } from "@/app/admin/employers/actions";

export default function ApproveButton({
  id,
}: {
  id: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await approveEmployer(id);
        })
      }
      className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
    >
      Approve
    </button>
  );
}