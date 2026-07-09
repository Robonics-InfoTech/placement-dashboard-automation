import { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import AcademicInfo from "./AcademicInfo";
import SkillsManager from "./SkillsManager";
import { supabase } from "@/lib/supabase/client";
import { updateStudentProfile } from "@/lib/student/profile";
import { uploadFile, getFileUrl } from "@/lib/storage/upload";
import { getStudentProfileId } from "@/lib/student/helpers";

type Props = {
  profile: any;
};

export default function ProfileForm({ profile }: Props) {
    const [formData, setFormData] = useState({
  full_name: profile?.full_name ?? "",
  phone: profile?.phone ?? "",
  dob: profile?.dob ?? "",

  enrollment_number: profile?.enrollment_number ?? "",
  branch: profile?.branch ?? "",
  course: profile?.course ?? "",
  specialization: profile?.specialization ?? "",
  semester: profile?.semester ?? "",
  graduation_year: profile?.graduation_year ?? "",
  cgpa: profile?.cgpa ?? "",
  active_backlogs: profile?.active_backlogs ?? "",
});

const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState(false);
async function handlePhotoUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  try {
    setUploading(true);

    const file = e.target.files?.[0];

    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const studentId = await getStudentProfileId(user.id);

    const filePath = `${studentId}/${Date.now()}-${file.name}`;

    await uploadFile(
      "profile-photos",
      filePath,
      file
    );

    const photoUrl = await getFileUrl(
      "profile-photos",
      filePath
    );

    await updateStudentProfile(user.id, {
      photo_url: photoUrl,
    });

  } catch (error) {
    console.error(error);
  } finally {
    setUploading(false);
  }
}

async function handleSave() {
  try {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not found");
      return;
    }

    if (Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      alert("CGPA must be between 0 and 10.");
      return;
    }

    await updateStudentProfile(user.id, {
      full_name: formData.full_name,
      phone: formData.phone,
      dob: formData.dob,
      branch: formData.branch,
      course: formData.course,
      specialization: formData.specialization,
      semester: Number(formData.semester),
      graduation_year: Number(formData.graduation_year),
      cgpa: Number(formData.cgpa),
      active_backlogs: Number(formData.active_backlogs),
    });

    alert("Profile updated successfully!");
  } catch (error) {
    console.error(error);
    alert("Failed to update profile.");
  } finally {
    setSaving(false);
  }
}

return (
  <div className="space-y-8">

    {/* Top Section */}

    <div className="grid gap-8 lg:grid-cols-3">

      {/* Profile Photo */}

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md p-8">

        <h2 className="mb-6 text-2xl font-semibold text-white">
          Profile Photo
        </h2>

        <div className="flex flex-col items-center">

<div className="mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-700 bg-slate-800">

  {profile?.photo_url ? (
    <img
      src={profile.photo_url}
      alt="Profile"
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="text-slate-500">
      No Photo
    </span>
  )}

</div>

<label className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium text-white transition hover:opacity-90">

  {uploading ? "Uploading..." : "Upload Photo"}

  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handlePhotoUpload}
  />

</label>
        </div>

      </div>

      <div className="lg:col-span-2">

<PersonalInfo
  formData={formData}
  setFormData={setFormData}
  email={profile?.email}
/>

      </div>

    </div>

<AcademicInfo
  formData={formData}
  setFormData={setFormData}
/>

    <SkillsManager />

    <div className="flex justify-end">

<button
  onClick={handleSave}
  disabled={saving}
  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
>
  {saving ? "Saving..." : "Save Changes"}
</button>

    </div>

  </div>
);
}