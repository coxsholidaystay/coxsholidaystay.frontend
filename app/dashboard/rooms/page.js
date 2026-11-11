import RoomAdminDashboard from "../../components/RoomAdminDashboard";

export const metadata = {
  title: "Rooms & inventory",
  robots: { index: false, follow: false }
};

export default function RoomDashboardPage() {
  return <RoomAdminDashboard />;
}
