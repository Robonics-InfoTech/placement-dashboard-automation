import React from "react";

type AcademicInfoProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function AcademicInfo({
  formData,
  setFormData,
}: AcademicInfoProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">
          Academic Information
        </h2>

        <p className="mt-2 text-slate-400">
          Your academic details determine eligibility for placement drives.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Enrollment Number
          </label>

          <input
            value={formData.enrollment_number}
            onChange={(e) =>
              setFormData({
                ...formData,
                enrollment_number: e.target.value,
              })
            }
            placeholder="Enrollment Number"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Course
          </label>

          <input
            value={formData.course}
            onChange={(e) =>
              setFormData({
                ...formData,
                course: e.target.value,
              })
            }
            placeholder="Course"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Branch
          </label>

          <input
            value={formData.branch}
            onChange={(e) =>
              setFormData({
                ...formData,
                branch: e.target.value,
              })
            }
            placeholder="Branch"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Specialization
          </label>

          <input
            value={formData.specialization}
            onChange={(e) =>
              setFormData({
                ...formData,
                specialization: e.target.value,
              })
            }
            placeholder="Specialization"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Semester
          </label>

          <input
            type="number"
            value={formData.semester}
            onChange={(e) =>
              setFormData({
                ...formData,
                semester: e.target.value,
              })
            }
            placeholder="Semester"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Graduation Year
          </label>

          <input
            type="number"
            value={formData.graduation_year}
            onChange={(e) =>
              setFormData({
                ...formData,
                graduation_year: e.target.value,
              })
            }
            placeholder="Graduation Year"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            CGPA
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.cgpa}
            onChange={(e) =>
              setFormData({
                ...formData,
                cgpa: e.target.value,
              })
            }
            placeholder="CGPA"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Active Backlogs
          </label>

          <input
            type="number"
            min="0"
            value={formData.active_backlogs}
            onChange={(e) =>
              setFormData({
                ...formData,
                active_backlogs: e.target.value,
              })
            }
            placeholder="Active Backlogs"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white"
          />
        </div>

      </div>
    </div>
  );
}