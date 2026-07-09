import JobsPage from "@/components/student/JobsPage";

export default function StudentJobs() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-7xl p-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Browse Jobs
          </h1>

          <p className="mt-2 text-slate-400">
            Explore placement opportunities from top recruiters.
          </p>
        </div>

        <JobsPage />

      </div>
    </main>
  );
}