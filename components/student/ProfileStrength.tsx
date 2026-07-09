"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  phone: string | null;
  branch: string | null;
  cgpa: number | null;
  graduation_year: number | null;
  resume_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
};

export default function ProfileStrength() {
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileStrength();
  }, []);

  async function loadProfileStrength() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("student_profiles")
.select(`
  id,
  full_name,
  phone,
  branch,
  cgpa,
  graduation_year,
  resume_url,
  linkedin_url,
  github_url,
  portfolio_url
`)
      .eq("user_id", user.id)
      .single();

const { data: skills } = await supabase
  .from("student_skills")
  .select("id")
  .eq("student_id", profile?.id);
  
    const checks = [
      {
        label: "Full Name",
        complete: !!profile?.full_name,
      },
      {
        label: "Phone Number",
        complete: !!profile?.phone,
      },
      {
        label: "Branch",
        complete: !!profile?.branch,
      },
      {
        label: "CGPA",
        complete: profile?.cgpa != null,
      },
      {
        label: "Graduation Year",
        complete: profile?.graduation_year != null,
      },
      {
        label: "Resume Uploaded",
        complete: !!profile?.resume_url,
      },
      {
        label: "LinkedIn Added",
        complete: !!profile?.linkedin_url,
      },
      {
        label: "GitHub Added",
        complete: !!profile?.github_url,
      },
      {
        label: "Portfolio Added",
        complete: !!profile?.portfolio_url,
      },
      {
        label: "Skills Added",
        complete: (skills?.length ?? 0) > 0,
      },
    ];

    const complete = checks.filter(c => c.complete);
    const incomplete = checks.filter(c => !c.complete);

    setCompleted(complete.map(c => c.label));
    setMissing(incomplete.map(c => c.label));
    setScore(complete.length * 10);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="sd-card">
        <div className="sd-card-title">
          Profile Strength
        </div>

        <p style={{ color: "#64748B" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="sd-card">
      <div className="sd-card-title">
        Profile Strength
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "white",
        }}
      >
        {score}%
      </div>

      <div className="sd-profile-bar-wrap">
        <div
          className="sd-profile-bar"
          style={{ width: `${score}%` }}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {completed.map((item) => (
          <div
            key={item}
            style={{
              color: "#10B981",
              fontSize: 13,
            }}
          >
            ✅ {item}
          </div>
        ))}

        {missing.map((item) => (
          <div
            key={item}
            style={{
              color: "#F59E0B",
              fontSize: 13,
            }}
          >
            ⚠ {item}
          </div>
        ))}
      </div>
    </div>
  );
}