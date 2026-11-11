import RecoveryPage from "./components/RecoveryPage";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true }
};

export default function NotFoundPage() {
  return (
    <RecoveryPage
      code="404"
      eyebrow="A SMALL DETOUR"
      title="This place is a little off the map."
      description="We can’t find the page you were looking for. The good news? There are plenty of lovely places still ahead."
    />
  );
}
