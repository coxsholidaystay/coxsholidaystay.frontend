import { OverviewDashboard } from "./DashboardPages";

export const metadata = {
  title: "Dashboard overview",
  robots: { index: false, follow: false }
};

export default function DashboardOverviewPage() {
  return <OverviewDashboard />;
}
