import LogoutButton from "@/components/auth/LogoutButton";

export default function AdminDashboard() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <h1>Admin Dashboard</h1>

      <LogoutButton />
    </div>
  );
}