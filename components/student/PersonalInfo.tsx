import React from "react";

type PersonalInfoProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  email?: string;
};

export default function PersonalInfo({
  formData,
  setFormData,
  email,
}: PersonalInfoProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">
          Personal Information
        </h2>

        <p className="mt-2 text-slate-400">
          Keep your personal details up to date for placement communications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Full Name
          </label>

          <input
            value={formData.full_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                full_name: e.target.value,
              })
            }
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Email Address
          </label>

          <input
            value={email ?? ""}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-slate-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Phone Number
          </label>

          <input
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            placeholder="Enter your phone number"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Date of Birth
          </label>

          <input
            type="date"
            value={formData.dob}
            onChange={(e) =>
              setFormData({
                ...formData,
                dob: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>
    </div>
  );
}