import OffersPage from "@/components/student/OffersPage";

export default function StudentOffersPage() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-7xl p-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            My Offers
          </h1>

          <p className="mt-2 text-slate-400">
            View and respond to your placement offers.
          </p>
        </div>

        <OffersPage />

      </div>
    </main>
  );
}