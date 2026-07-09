"use client";

import { useEffect, useState } from "react";

import ProfileForm from "@/components/student/ProfileForm";
import { supabase } from "@/lib/supabase/client";
import { getStudentProfile } from "@/lib/student/profile";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        const data = await getStudentProfile(user.id);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B1020] flex items-center justify-center text-white">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto max-w-7xl p-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Student Profile</h1>

          <p className="mt-2 text-slate-400">
            Manage your personal, academic and placement profile.
          </p>
        </div>

        <ProfileForm profile={profile} />

      </div>
    </main>
  );
}