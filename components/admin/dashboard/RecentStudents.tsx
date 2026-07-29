import { RecentStudent } from "@/lib/admin/dashboard";

interface Props {
  students: RecentStudent[];
}

export default function RecentStudents({ students }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white">
          Recent Students
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Latest registered students
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead className="bg-slate-950 text-left text-sm text-slate-400">

            <tr>

              <th className="px-6 py-4">Student</th>

              <th className="px-6 py-4">Enrollment</th>

              <th className="px-6 py-4">Branch</th>

              <th className="px-6 py-4">Semester</th>

              <th className="px-6 py-4">Status</th>

              <th className="px-6 py-4">Verified</th>

            </tr>

          </thead>

          <tbody>

            {students.map((student) => (

              <tr
                key={student.id}
                className="border-t border-slate-800 hover:bg-slate-800/40"
              >

                <td className="px-6 py-4 font-medium text-white">
                  {student.full_name}
                </td>

                <td className="px-6 py-4 text-slate-300">
                  {student.enrollment_number}
                </td>

                <td className="px-6 py-4 text-slate-300">
                  {student.branch}
                </td>

                <td className="px-6 py-4 text-slate-300">
                  {student.semester}
                </td>

                <td className="px-6 py-4">

                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                    {student.placement_status}
                  </span>

                </td>

                <td className="px-6 py-4">

                  {student.is_verified ? (
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
                      Pending
                    </span>
                  )}

                </td>

              </tr>

            ))}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  No students found.
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}