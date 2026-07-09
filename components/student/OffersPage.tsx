"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import {
  getStudentOffers,
  updateOfferStatus,
} from "@/lib/student/offers";
import { getStudentProfile } from "@/lib/student/jobs";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const student = await getStudentProfile(user.id);

      const data = await getStudentOffers(student.id);

      setOffers(data);
    } finally {
      setLoading(false);
    }
  }

  async function respond(
    id: string,
    status: "accepted" | "declined"
  ) {
    await updateOfferStatus(id, status);

    loadOffers();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
        Loading offers...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {offers.length === 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">
          No placement offers yet.
        </div>
      )}

      {offers.map((offer) => (
        <div
          key={offer.id}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6"
        >
          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-2xl font-semibold">
                {offer.applications?.jobs?.title}
              </h2>

              <p className="mt-1 text-slate-400">
                {offer.applications?.jobs?.company_name}
              </p>
            </div>

            <span className="rounded-full bg-indigo-600/20 px-4 py-2 text-indigo-300">
              {offer.offer_status}
            </span>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div>
              <p className="text-sm text-slate-500">
                Package
              </p>

              <p>{offer.package_lpa} LPA</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Joining Date
              </p>

              <p>{offer.joining_date}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Remarks
              </p>

              <p>{offer.remarks ?? "-"}</p>
            </div>

          </div>

          {offer.offer_status === "issued" && (

            <div className="mt-6 flex gap-3 justify-end">

              <button
                onClick={() =>
                  respond(offer.id, "accepted")
                }
                className="rounded-xl bg-green-600 px-6 py-3 font-medium"
              >
                Accept
              </button>

              <button
                onClick={() =>
                  respond(offer.id, "declined")
                }
                className="rounded-xl bg-red-600 px-6 py-3 font-medium"
              >
                Decline
              </button>

            </div>

          )}

        </div>
      ))}

    </div>
  );
}