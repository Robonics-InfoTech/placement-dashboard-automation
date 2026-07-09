"use client";

import { useEffect, useState } from "react";
import {
  addStudentSkill,
  deleteStudentSkill,
  getStudentSkills,
} from "@/lib/student/skills";
import { supabase } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { getStudentProfileId } from "@/lib/student/helpers";

export default function SkillsManager() {
type Skill = {
  id: string;
  student_id: string;
  skill_name: string;
};

const [skills, setSkills] = useState<Skill[]>([]);

  const [input, setInput] = useState("");
useEffect(() => {
  loadSkills();
}, []);

async function loadSkills() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const studentId = await getStudentProfileId(user.id);

  const data = await getStudentSkills(studentId);

  setSkills(data);
}

async function addSkill() {
  const skill = input.trim();

  if (!skill) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const studentId = await getStudentProfileId(user.id);

  await addStudentSkill(studentId, skill);

  setInput("");

  await loadSkills();
}

async function removeSkill(id: string) {
  await deleteStudentSkill(id);

  setSkills((prev) =>
    prev.filter((skill) => skill.id !== id)
  );
}

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md p-8">

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">
          Skills
        </h2>

        <p className="mt-2 text-slate-400">
          Add the technologies and tools you are comfortable with.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">

        {skills.map((skill) => (

          <div
            key={skill.id}
            className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-indigo-300"
          >
{skill.skill_name}

            <button
              onClick={() => removeSkill(skill.id)}
              className="hover:text-red-400 transition"
            >
              <X size={16} />
            </button>

          </div>

        ))}

      </div>

      <div className="flex gap-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Add a skill..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
        />

        <button
          onClick={addSkill}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium"
        >
          Add
        </button>

      </div>

    </div>
  );
}