import JobDetails from "@/components/student/JobDetails";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-6xl p-8">

        <JobDetails jobId={id} />

      </div>
    </main>
  );
}