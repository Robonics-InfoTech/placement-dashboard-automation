import LogoutButton from "@/components/auth/LogoutButton";

export default function EmployerDashboard() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <h1>Employer Dashboard</h1>

      <LogoutButton />
    </div>
  );
}