import { UserDashboard } from "../DashboardPages";

export const metadata = {
  title: "Users & guests",
  robots: { index: false, follow: false }
};

export default function UsersPage() {
  return <UserDashboard />;
}
