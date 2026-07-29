"use client";

import { useMemo, useState } from "react";
import ApproveButton from "./ApproveButton";
import RejectButton from "./RejectButton";

interface Employer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  verified: boolean;
}

export default function EmployersTable({
  employers,
}: {
  employers: Employer[];
}) {
    const [search, setSearch] = useState("");
    const filteredEmployers = useMemo(() => {
  const term = search.toLowerCase();

  return employers.filter((employer) =>
    [
      employer.company_name,
      employer.contact_person,
      employer.email,
      employer.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term)
  );
}, [employers, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <div className="border-b border-slate-800 p-4">
  <input
    type="text"
    placeholder="Search employers..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
  />
</div>

        <table className="min-w-full">
          <thead className="border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Company
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Contact Person
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Phone
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {employers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center py-10">
  <p className="text-lg font-medium text-slate-300">
    No Pending Employers
  </p>

  <p className="mt-2 text-sm text-slate-500">
    All employer registrations have been reviewed.
  </p>
</div>
                </td>
              </tr>
            ) : (
              filteredEmployers.map((employer) => (
                <tr
                  key={employer.id}
                  className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {employer.company_name}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {employer.contact_person}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {employer.email}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {employer.phone}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                      Pending
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ApproveButton id={employer.id} />
                      <RejectButton id={employer.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}