import type { UpcomingDrive } from "@/lib/admin/dashboard";

interface Props {
  drives: UpcomingDrive[];
}

export default function UpcomingDrives({ drives }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white">
          Upcoming Placement Drives
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Scheduled recruitment drives
        </p>
      </div>

      {drives.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No upcoming drives
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {drives.map((drive) => (
            <div
              key={drive.id}
              className="flex items-center justify-between p-5"
            >
              <div>
                <h3 className="font-medium text-white">
                  {drive.drive_name}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {new Date(drive.drive_date).toLocaleDateString()}
                </p>

                <p className="text-sm text-slate-500">
                  {drive.venue}
                </p>
              </div>

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                {drive.drive_mode}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}