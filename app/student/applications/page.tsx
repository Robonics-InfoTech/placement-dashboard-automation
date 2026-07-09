import ApplicationsPage from "@/components/student/ApplicationsPage";

export default function StudentApplicationsPage() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-7xl p-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            My Applications
          </h1>

          <p className="mt-2 text-slate-400">
            Track every placement application you've submitted.
          </p>
        </div>

        <ApplicationsPage />

      </div>
    </main>
  );
}