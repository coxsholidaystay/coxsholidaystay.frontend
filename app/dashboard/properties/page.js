import { PropertyDashboard } from "../DashboardPages";

export const metadata = {
  title: "Properties",
  robots: { index: false, follow: false }
};

export default function PropertiesPage() {
  return <PropertyDashboard />;
}
