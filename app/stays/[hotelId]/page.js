import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/SiteChrome";
import { hotels } from "../../../lib/hotels";
import { rooms } from "../../../lib/rooms";
import RoomRequestButton from "../../components/RoomRequestButton";

const hotelNotes = {
  "casa-del-mar": {
    intro: "A sun-washed hideaway on Italy’s storied coastline, where the sea is always in view and the days move at their own gentle pace.",
    highlights: ["Steps from the water", "Breakfast made with local produce", "Terrace overlooking the coast"]
  },
  "the-palm-house": {
    intro: "A private tropical retreat tucked among Ubud’s palms, designed for slow mornings, cool dips, and a little more breathing room.",
    highlights: ["Private pool", "Surrounded by tropical gardens", "Easy access to Ubud"]
  },
  "azure-bay": {
    intro: "An overwater escape surrounded by the clear blues of the North Malé Atoll, with island life just beyond your doorstep.",
    highlights: ["Overwater villa setting", "Direct ocean access", "Quiet island atmosphere"]
  },
  "cove-and-cliff": {
    intro: "A coastal hideaway in Cox’s Bazar for long beach walks, warm hospitality, and evenings that end with the sound of the sea.",
    highlights: ["Near the shoreline", "Relaxed coastal dining", "A thoughtful local welcome"]
  },
  "casa-luce": {
    intro: "Whitewashed calm and wide caldera views make this Santorini stay a lovely place to slow down and take in the Aegean light.",
    highlights: ["Caldera-facing views", "Private terrace", "Sunset-facing setting"]
  },
  "the-wildwood": {
    intro: "A quiet lodge framed by northern Thailand’s greenery, made for restorative mornings and days spent close to nature.",
    highlights: ["Forest-fringed setting", "Peaceful outdoor spaces", "A restful base near Chiang Mai"]
  }
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

export function generateStaticParams() {
  return hotels.map((hotel) => ({ hotelId: hotel.id }));
}

export async function generateMetadata({ params }) {
  const hotel = hotels.find((item) => item.id === params.hotelId);
  return hotel ? { title: hotel.name, description: hotel.imageAlt } : {};
}

export default function HotelDetailsPage({ params }) {
  const hotel = hotels.find((item) => item.id === params.hotelId);
  if (!hotel) notFound();

  const notes = hotelNotes[hotel.id];
  const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id);
  const gallery = [
    hotel.image,
    ...hotels.filter((item) => item.id !== hotel.id).slice(0, 3).map((item) => item.image)
  ];

  return (
    <PageShell>
      <section className="stay-detail content-width">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><Link href="/rooms">Stays</Link><span>/</span><span>{hotel.name}</span>
        </nav>
        <div className="detail-title-row">
          <div>
            <p className="eyebrow">{hotel.category.toUpperCase()}</p>
            <h1>{hotel.name}</h1>
            <p className="detail-location"><span aria-hidden="true">⌖</span> {hotel.location}</p>
          </div>
          <div className="detail-rating"><span aria-hidden="true">★</span> {hotel.rating} <small>({hotel.reviews} thoughtful reviews)</small></div>
        </div>
        <div className="stay-gallery">
          {gallery.map((image, index) => (
            <img key={image} className={`stay-gallery-image stay-gallery-image-${index + 1}`} src={image} alt={index === 0 ? hotel.imageAlt : `${hotel.name} surroundings`} />
          ))}
        </div>
        <div className="stay-detail-layout">
          <div className="stay-detail-main">
            <section className="detail-copy">
              <p className="eyebrow">A PLACE TO SETTLE IN</p>
              <h2>Somewhere that feels like <em>your own.</em></h2>
              <p>{notes.intro}</p>
            </section>
            <section className="detail-highlights" aria-labelledby="highlights-title">
              <h2 id="highlights-title">The little details</h2>
              <div className="highlight-list">
                {notes.highlights.map((item) => <span key={item}><span aria-hidden="true">✦</span> {item}</span>)}
              </div>
            </section>
            <section className="detail-rooms" id="rooms" aria-labelledby="room-options-title">
              <div className="section-heading">
                <div><p className="eyebrow">MAKE IT YOURS</p><h2 id="room-options-title">Choose your room</h2></div>
              </div>
              {hotelRooms.map((room) => (
                <article className="detail-room-card" key={room.id}>
                  <img src={room.image} alt={room.imageAlt} loading="lazy" />
                  <div><p className="editorial-meta">{room.type}</p><h3>{room.name}</h3><p className="editorial-meta">Sleeps up to {room.capacity}</p></div>
                  <p className="hotel-price"><strong>{formatPrice(room.price)}</strong><span> / night</span></p>
                  <RoomRequestButton className="hotel-book-link room-detail-request" room={room} />
                </article>
              ))}
            </section>
          </div>
          <aside className="stay-booking-card">
            <p className="eyebrow">A STAY TO REMEMBER</p>
            <p className="hotel-price"><strong>{formatPrice(hotel.price)}</strong><span> / night</span></p>
            <p>Thoughtful details, a lovely place to land, and room to make it your own.</p>
            <Link className="search-button stay-booking-link" href="#rooms">Choose a room <span aria-hidden="true">↓</span></Link>
            <small>Send a room request without signing in.</small>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
