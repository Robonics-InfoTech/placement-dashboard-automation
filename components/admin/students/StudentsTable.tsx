"use client";

import { useMemo, useState } from "react";
import { Student } from "@/lib/admin/students";
import VerifyButton from "./VerifyButton";
import SuspendButton from "./SuspendButton";
import StudentProfileModal from "./StudentProfileModal";
import { bulkVerifyStudents } from "@/app/admin/students/actions";
import { bulkSuspendStudents } from "@/app/admin/students/actions";


interface Props {
  students: Student[];
}

export default function StudentsTable({ students }: Props) {
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [branchFilter, setBranchFilter] =
    useState("All Branches");

  const [semesterFilter, setSemesterFilter] =
    useState("All Semesters");

  const [statusFilter, setStatusFilter] =
    useState("All");
    
  const [selectedStudents, setSelectedStudents] =
  useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        query === "" ||
        student.full_name
          ?.toLowerCase()
          .includes(query) ||
        student.enrollment_number
          ?.toLowerCase()
          .includes(query) ||
        student.branch
          ?.toLowerCase()
          .includes(query) ||
        student.course
          ?.toLowerCase()
          .includes(query);

      const matchesBranch =
        branchFilter === "All Branches" ||
        student.branch === branchFilter;

      const matchesSemester =
        semesterFilter === "All Semesters" ||
        String(student.semester) === semesterFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Verified" &&
          student.is_verified) ||
        (statusFilter === "Pending" &&
          !student.is_verified);

      return (
        matchesSearch &&
        matchesBranch &&
        matchesSemester &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    branchFilter,
    semesterFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
  1,
  Math.ceil(filteredStudents.length / rowsPerPage)
  );

  const paginatedStudents = filteredStudents.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage 
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
      {/* Toolbar */}
<div className="border-b border-slate-800 p-6">
  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

    <div className="flex flex-wrap items-center gap-3">

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, enrollment, course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-72 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
      />

      {/* Branch */}
      <select
        value={branchFilter}
        onChange={(e) => setBranchFilter(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      >
        <option>All Branches</option>

        {[...new Set(students.map((s) => s.branch).filter(Boolean))].map(
          (branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          )
        )}
      </select>

      {/* Semester */}
      <select
        value={semesterFilter}
        onChange={(e) => setSemesterFilter(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      >
        <option>All Semesters</option>

        {[...new Set(students.map((s) => s.semester).filter(Boolean))].map(
          (semester) => (
            <option
              key={semester}
              value={String(semester)}
            >
              Semester {semester}
            </option>
          )
        )}
      </select>

      {/* Status */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      >
        <option value="All">All Status</option>
        <option value="Verified">Verified</option>
        <option value="Pending">Pending</option>
      </select>

      {/* Export */}
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
        Export CSV
      </button>

    </div>

    <div className="flex flex-wrap gap-6 text-sm">

      <div>
        <p className="text-slate-500">Students</p>
        <p className="font-semibold text-white">
          {filteredStudents.length}
        </p>
      </div>

      <div>
        <p className="text-slate-500">Verified</p>
        <p className="font-semibold text-green-400">
          {filteredStudents.filter((s) => s.is_verified).length}
        </p>
      </div>

      <div>
        <p className="text-slate-500">Pending</p>
        <p className="font-semibold text-yellow-400">
          {filteredStudents.filter((s) => !s.is_verified).length}
        </p>
      </div>

      <div>
        <p className="text-slate-500">Suspended</p>
        <p className="font-semibold text-red-400">
          {filteredStudents.filter((s) => s.is_suspended).length}
        </p>
      </div>

    </div>

  </div>
</div>

{/* Bulk Action Bar */}
{selectedStudents.length > 0 && (
  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
    <div className="text-sm text-slate-300">
      <span className="font-semibold text-white">
        {selectedStudents.length}
      </span>{" "}
      student(s) selected
    </div>

    <div className="flex items-center gap-3">
      <button
            onClick={async () => {
                if (selectedStudents.length === 0) return;

                const confirmVerify = window.confirm(
                `Verify ${selectedStudents.length} selected student(s)?`
                );

                if (!confirmVerify) return;

                try {
                await bulkVerifyStudents(selectedStudents);
                setSelectedStudents([]);
                } catch (error) {
                console.error(error);
                alert("Failed to verify students.");
                }
            }}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
            Bulk Verify
            </button>

      <button
        onClick={async () => {
            if (selectedStudents.length === 0) return;

            const confirmSuspend = window.confirm(
            `Suspend ${selectedStudents.length} selected student(s)?`
            );

            if (!confirmSuspend) return;

            try {
            await bulkSuspendStudents(selectedStudents);
            setSelectedStudents([]);
            } catch (error) {
            console.error(error);
            alert("Failed to suspend students.");
            }
        }}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
        Bulk Suspend
        </button>

      <button
        onClick={() => setSelectedStudents([])}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        Clear Selection
      </button>
    </div>
  </div>
)}

{/* Table */}
<div className="w-full overflow-x-auto">
  <table className="w-full min-w-[1550px] border-collapse">

    <thead className="bg-slate-950">

      <tr className="text-left text-sm font-medium text-slate-400">

        <th className="px-6 py-4">
  <input
    type="checkbox"
    checked={
      paginatedStudents.length > 0 &&
      selectedStudents.length === paginatedStudents.length
    }
    onChange={() => {
      if (
        selectedStudents.length ===
        paginatedStudents.length
      ) {
        setSelectedStudents([]);
      } else {
        setSelectedStudents(
          paginatedStudents.map((s) => s.id)
        );
      }
    }}
    className="h-4 w-4"
  />
        </th>

        <th className="px-6 py-4">
          Student
        </th>

        <th className="px-6 py-4">
          Enrollment
        </th>

        <th className="px-6 py-4">
          Branch
        </th>

        <th className="px-6 py-4">
          Semester
        </th>

        <th className="px-6 py-4">
          CGPA
        </th>

        <th className="px-6 py-4">
          Placement
        </th>

        <th className="px-6 py-4">
          Verified
        </th>

        <th className="px-6 py-4">
          Suspended
        </th>

        <th className="sticky right-0 bg-slate-950 px-6 py-4 text-center">
          Actions
        </th>

      </tr>

    </thead>

    <tbody className="divide-y divide-slate-800">

      {filteredStudents.map((student) => {

        const fullName =
          student.full_name?.trim() ||
          "Unknown Student";

        const initials =
          fullName.charAt(0).toUpperCase();

        const isSelected =
          selectedStudents.includes(student.id);

        return (

          <tr
            key={student.id}
            className={`transition hover:bg-slate-800/40 ${
              isSelected
                ? "bg-blue-500/10"
                : ""
            }`}
          >

            <td className="px-6 py-5">

              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    setSelectedStudents((prev) =>
                      prev.filter(
                        (id) =>
                          id !== student.id
                      )
                    );
                  } else {
                    setSelectedStudents((prev) => [
                      ...prev,
                      student.id,
                    ]);
                  }
                }}
                className="h-4 w-4"
              />

            </td>
                        {/* Student */}
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {initials}
                </div>

                <div>
                  <p className="font-medium text-white">
                    {fullName}
                  </p>

                  <p className="text-xs text-slate-400">
                    {student.course || "-"}
                  </p>
                </div>

              </div>
            </td>

            {/* Enrollment */}
            <td className="px-6 py-5 text-slate-300">
              {student.enrollment_number || "-"}
            </td>

            {/* Branch */}
            <td className="px-6 py-5 text-slate-300">
              {student.branch || "-"}
            </td>

            {/* Semester */}
            <td className="px-6 py-5 text-slate-300">
              {student.semester ?? "-"}
            </td>

            {/* CGPA */}
            <td className="px-6 py-5 text-slate-300">
              {student.cgpa ?? "-"}
            </td>

            {/* Placement */}
            <td className="px-6 py-5">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                {student.placement_status || "Not Assigned"}
              </span>
            </td>

            {/* Verification */}
            <td className="px-6 py-5">
              {student.is_verified ? (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  Verified
                </span>
              ) : (
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                  Pending
                </span>
              )}
            </td>

            {/* Suspension */}
            <td className="px-6 py-5">
              {student.is_suspended ? (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                  Suspended
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  Active
                </span>
              )}
            </td>

            {/* Actions */}
            <td className="sticky right-0 bg-slate-900 px-6 py-5">

              <div className="flex justify-center gap-2 whitespace-nowrap">

                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setOpen(true);
                  }}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  View
                </button>

                <VerifyButton
                  studentId={student.id}
                  disabled={student.is_verified}
                />

                <SuspendButton
                  studentId={student.id}
                  disabled={student.is_suspended}
                />

              </div>

            </td>

          </tr>

        );
      })}
            {filteredStudents.length === 0 && (
        <tr>
          <td
            colSpan={10}
            className="py-16 text-center text-slate-500"
          >
            <div className="flex flex-col items-center gap-2">

              <p className="text-lg font-medium text-slate-300">
                No students found
              </p>

              <p className="text-sm text-slate-500">
                Try changing your search or filters.
              </p>

            </div>
          </td>
        </tr>
      )}

    </tbody>

  </table>
</div>

<div className="flex flex-col gap-4 border-t border-slate-800 px-6 py-4 md:flex-row md:items-center md:justify-between">

  <div className="flex items-center gap-3">
    <span className="text-sm text-slate-400">
      Rows per page
    </span>

    <select
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
    </select>
  </div>

  <div className="flex items-center gap-4">

    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="rounded-lg border border-slate-700 px-4 py-2 text-white disabled:opacity-40"
    >
      Previous
    </button>

    <span className="text-sm text-slate-300">
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="rounded-lg border border-slate-700 px-4 py-2 text-white disabled:opacity-40"
    >
      Next
    </button>

  </div>

</div>

<StudentProfileModal
  student={selectedStudent}
  open={open}
  onClose={() => setOpen(false)}
/>

</div>

);
}

