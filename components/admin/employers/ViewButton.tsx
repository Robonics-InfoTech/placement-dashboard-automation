"use client";

import { useState } from "react";
import EmployerDetailsModal from "./EmployerDetailsModal";

interface Employer {
  company_name: string;
  industry: string;
  website: string;
  company_size: string;
  company_description: string | null;
  contact_person: string;
  designation: string;
  phone: string;
  verified: boolean;
}

export default function ViewButton({
  employer,
}: {
  employer: Employer;
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
        <EmployerDetailsModal
          employer={employer}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}