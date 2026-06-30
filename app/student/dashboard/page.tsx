import LogoutButton from "@/components/auth/LogoutButton";

export default function StudentDashboard() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <h1>Student Dashboard</h1>

      <LogoutButton />
    </div>
  );
}