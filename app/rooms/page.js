import { PageShell } from "../components/SiteChrome";
import RoomCatalog from "./RoomCatalog";

export const metadata = {
  title: "Rooms & stays",
  description: "Browse our considered collection of rooms, suites, and private villas."
};

export default function RoomsPage() {
  return (
    <PageShell>
      <section className="page-hero rooms-page-hero">
        <div className="page-hero-content">
          <p className="eyebrow hero-eyebrow"><span /> THE COLLECTION</p>
          <h1>Find a room to <em>make your own.</em></h1>
          <p>Thoughtful rooms, distinctive places, and space to settle into somewhere new.</p>
          <a className="hero-link" href="#all-rooms">Explore all rooms <span aria-hidden="true">↓</span></a>
        </div>
      </section>
      <RoomCatalog />
    </PageShell>
  );
}
