"use client";

import { useTransition } from "react";
import { suspendStudent } from "@/app/admin/students/actions";

interface Props {
  studentId: string;
  disabled?: boolean;
}

export default function SuspendButton({
  studentId,
  disabled = false,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSuspend = () => {
    if (!confirm("Suspend this student?")) return;

    startTransition(async () => {
      await suspendStudent(studentId);
    });
  };

  return (
    <button
      onClick={handleSuspend}
      disabled={disabled || isPending}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
    >
      {isPending ? "Suspending..." : "Suspend"}
    </button>
  );
}