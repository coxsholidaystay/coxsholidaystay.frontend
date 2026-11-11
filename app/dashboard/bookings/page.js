import { BookingDashboard } from "../DashboardPages";

export const metadata = {
  title: "Booking requests",
  robots: { index: false, follow: false }
};

export default function BookingRequestsPage() {
  return <BookingDashboard />;
}
