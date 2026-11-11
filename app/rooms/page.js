import Link from "next/link";
import { PageShell } from "../components/SiteChrome";
import RoomRequestButton from "../components/RoomRequestButton";
import { rooms } from "../../lib/rooms";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

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
      <section className="listing-section content-width" id="all-rooms">
        <div className="section-heading">
          <div><p className="eyebrow">A GOOD PLACE TO BEGIN</p><h2>Rooms worth coming back to</h2></div>
          <span className="listing-count">{rooms.length} considered stays</span>
        </div>
        <div className="room-grid">
          {rooms.map((room) => (
            <article className="editorial-card room-card" key={room.id}>
              <Link className="editorial-card-image" href={`/stays/${room.hotelId}`}>
                <img src={room.image} alt={room.imageAlt} loading="lazy" />
                <span className="editorial-image-tag">{room.name}</span>
              </Link>
              <div className="editorial-card-content">
                <p className="editorial-meta">{room.location}</p>
                <h3><Link href={`/stays/${room.hotelId}`}>{room.hotelName}</Link></h3>
                <p className="editorial-description">{room.type} · Sleeps {room.capacity}</p>
                <div className="editorial-card-bottom">
                  <p><strong>{formatPrice(room.price)}</strong> <span>/ night</span></p>
                  <Link className="editorial-arrow-link" href={`/stays/${room.hotelId}`} aria-label={`View ${room.hotelName}`}>↗</Link>
                </div>
                <RoomRequestButton className="hotel-book-link room-request-link" room={room} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
