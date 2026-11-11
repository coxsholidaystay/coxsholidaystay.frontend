"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "../../components/SiteChrome";
import HotelRoomList from "../../components/HotelRoomList";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

export default function HotelDetailsClient({ hotelId, initialHotel, initialHotels, hotelNotes }) {
  const [hotel, setHotel] = useState(initialHotel);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/hotels/${encodeURIComponent(hotelId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 404) {
          if (active) {
            setHotel(null);
            setLoadError("This property is not currently listed.");
          }
          return;
        }
        if (!response.ok) throw new Error(data.error || "Couldn't load this property.");
        if (active) setHotel(data.hotel);
      })
      .catch((error) => {
        if (active) setLoadError(error.message === "Failed to fetch"
          ? "Property details are temporarily unavailable. Please try again shortly."
          : error.message);
      });
    return () => { active = false; };
  }, [hotelId]);

  if (!hotel) {
    return (
      <PageShell>
        <section className="property-load-state content-width" role={loadError ? "alert" : "status"}>
          <p className="eyebrow">{loadError ? "PROPERTY UNAVAILABLE" : "PLEASE WAIT"}</p>
          <h1>{loadError || "Finding this stay…"}</h1>
          <Link className="search-button" href="/rooms">Explore available rooms</Link>
        </section>
      </PageShell>
    );
  }

  const notes = hotelNotes[hotel.id] || {
    intro: hotel.description || `${hotel.name} offers a thoughtful place to stay in ${hotel.location}. Contact the property for details about your visit.`,
    highlights: hotel.amenities?.length ? hotel.amenities : ["A considered place to stay", "Thoughtful guest service"]
  };
  const gallery = [
    hotel.image,
    ...initialHotels.filter((item) => item.id !== hotel.id).slice(0, 3).map((item) => item.image)
  ];

  return (
    <PageShell>
      <section className="stay-detail content-width">
        {loadError && <p className="property-load-warning" role="status">{loadError} Showing saved property details.</p>}
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
            <img key={`${image}-${index}`} className={`stay-gallery-image stay-gallery-image-${index + 1}`} src={image} alt={index === 0 ? hotel.imageAlt : `${hotel.name} surroundings`} />
          ))}
        </div>
        <div className="stay-detail-layout">
          <div className="stay-detail-main">
            <section className="detail-copy">
              <p className="eyebrow">A PLACE TO SETTLE IN</p>
              <h2>Somewhere that feels like <em>your own.</em></h2>
              <p>{notes.intro}</p>
              {hotel.address && <p className="property-address">{hotel.address}</p>}
            </section>
            <section className="detail-highlights" aria-labelledby="highlights-title">
              <h2 id="highlights-title">The little details</h2>
              <div className="highlight-list">
                {notes.highlights.map((item) => <span key={item}><span aria-hidden="true">✦</span> {item}</span>)}
              </div>
            </section>
            {(hotel.email || hotel.phone || hotel.website) && (
              <section className="property-contact" aria-label="Property contact information">
                {hotel.email && <a href={`mailto:${hotel.email}`}>{hotel.email}</a>}
                {hotel.phone && <a href={`tel:${hotel.phone}`}>{hotel.phone}</a>}
                {hotel.website && <a href={hotel.website} target="_blank" rel="noreferrer">Property website ↗</a>}
              </section>
            )}
            <section className="detail-rooms" id="rooms" aria-labelledby="room-options-title">
              <div className="section-heading">
                <div><p className="eyebrow">MAKE IT YOURS</p><h2 id="room-options-title">Choose your room</h2></div>
              </div>
              <HotelRoomList hotelId={hotel.id} />
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
