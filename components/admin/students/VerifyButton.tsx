"use client";

import { useTransition } from "react";
import { verifyStudent } from "@/app/admin/students/actions";

interface Props {
  studentId: string;
  disabled?: boolean;
}

export default function VerifyButton({
  studentId,
  disabled = false,
}: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await verifyStudent(studentId);
        })
      }
      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Verifying..." : "Verify"}
    </button>
  );
}