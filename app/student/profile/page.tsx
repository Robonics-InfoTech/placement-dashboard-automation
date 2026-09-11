"use client";

import PageHeader from "@/components/ui/PageHeader";
import ProfileForm from "@/components/student/ProfileForm";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStudentProfile } from "@/lib/student/profile";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        setProfile(await getStudentProfile(user.id));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="My Profile"
        description="Manage your personal, academic and placement information."
      />
      <div style={{ padding: "20px 28px 0" }}>
        {loading ? (
          <div style={{ height: 200, borderRadius: "var(--radius-xl)", background: "var(--bg-card)", border: "1px solid var(--border-primary)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : (
          <ProfileForm profile={profile} />
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}