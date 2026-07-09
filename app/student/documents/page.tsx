import DocumentsPage from "@/components/student/DocumentsPage";

export default function StudentDocumentsPage() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Documents
          </h1>

          <p className="mt-2 text-slate-400">
            Upload and manage your placement documents.
          </p>
        </div>

        <DocumentsPage />
      </div>
    </main>
  );
}