import AdminLayout from "@/components/admin/AdminLayout";
import StudentsTable from "@/components/admin/students/StudentsTable";
import { getStudents } from "@/lib/admin/students";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <AdminLayout title="Students">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold text-white">
            Student Management
          </h1>

          <p className="mt-2 text-slate-400">
            Verify students, suspend accounts, update placement status, and
            manage student records.
          </p>
        </div>

        {/* Students Table */}
        <StudentsTable students={students} />
      </div>
    </AdminLayout>
  );
}