"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "../../components/SiteChrome";
import RoomRequestButton from "../../components/RoomRequestButton";
import { getRoomById } from "../../../lib/rooms";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function normalizeRoom(room) {
  const images = room.images?.length ? room.images : [room.image].filter(Boolean);
  return {
    ...room,
    id: room.roomId || room.id,
    roomId: room.roomId || room.id,
    type: room.roomType || room.type,
    images,
    image: images[0],
    imageAlt: room.imageAlt || `${room.name} at ${room.hotelName}`,
    price: Number(room.price)
  };
}

function formatPrice(room) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: room.currency || "USD",
    maximumFractionDigits: 0
  }).format(room.price);
}

export default function RoomDetails({ roomId }) {
  const seed = getRoomById(roomId);
  const [room, setRoom] = useState(seed ? normalizeRoom(seed) : null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/rooms/${encodeURIComponent(roomId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "This room could not be found.");
        if (active) {
          setRoom(normalizeRoom(data.room));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active && !seed) setLoadError(error.message);
      });
    return () => { active = false; };
  }, [roomId, seed]);

  if (!room) {
    return (
      <PageShell>
        <section className="room-detail-state content-width" role={loadError ? "alert" : "status"}>
          <p className="eyebrow">{loadError ? "ROOM NOT AVAILABLE" : "ONE MOMENT"}</p>
          <h1>{loadError ? "We couldn't find this room." : "Gathering the room details."}</h1>
          <p>{loadError || "Loading the stay, amenities, and helpful details."}</p>
          {loadError && <Link className="search-button" href="/rooms">Explore all rooms</Link>}
        </section>
      </PageShell>
    );
  }

  const images = room.images;
  const policies = room.policies || {};

  return (
    <PageShell>
      <article className="room-detail content-width">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><Link href="/rooms">Rooms</Link>
          <span>/</span><span>{room.name}</span>
        </nav>
        <header className="room-detail-header">
          <div>
            <p className="eyebrow">{room.category} · {room.hotelName}</p>
            <h1>{room.name}</h1>
            <p className="detail-location"><span aria-hidden="true">⌖</span> {room.location}</p>
          </div>
          <Link className="room-detail-hotel-link" href={`/stays/${room.hotelId}`}>
            View property <span aria-hidden="true">↗</span>
          </Link>
        </header>
        <div className={`room-gallery room-gallery-count-${Math.min(images.length, 4)}`}>
          {images.slice(0, 4).map((image, index) => (
            <img
              key={`${image}-${index}`}
              className={`room-gallery-image room-gallery-image-${index + 1}`}
              src={image}
              alt={`${room.name} room photo ${index + 1}`}
              loading={index ? "lazy" : "eager"}
            />
          ))}
        </div>
        <div className="room-detail-layout">
          <div className="room-detail-main">
            <p className="room-detail-lede">{room.shortDescription}</p>
            <div className="room-fact-grid" aria-label="Room facts">
              <div><span aria-hidden="true">⌂</span><strong>{room.sizeSqm} m²</strong><small>Room size</small></div>
              <div><span aria-hidden="true">♙</span><strong>{room.capacity} guests</strong><small>Maximum capacity</small></div>
              <div><span aria-hidden="true">▤</span><strong>{room.bedrooms} bedroom{room.bedrooms === 1 ? "" : "s"}</strong><small>{room.bathrooms} bathroom{room.bathrooms === 1 ? "" : "s"}</small></div>
              <div><span aria-hidden="true">⌑</span><strong>{room.view}</strong><small>Room view</small></div>
            </div>

            <section className="room-detail-section">
              <p className="eyebrow">THE SPACE</p>
              <h2>Make yourself <em>at home.</em></h2>
              <p className="room-detail-copy">{room.description}</p>
            </section>

            <section className="room-detail-section">
              <p className="eyebrow">SLEEP WELL</p>
              <h2>Beds &amp; layout</h2>
              <div className="room-bed-list">
                {(room.beds || []).map((bed, index) => (
                  <div key={`${bed.type}-${index}`}><span aria-hidden="true">▱</span><strong>{bed.count} × {bed.type}</strong></div>
                ))}
                <p>{room.adults} adults{room.children ? ` · up to ${room.children} children` : ""} · {room.bedrooms} bedroom · {room.bathrooms} bathroom</p>
              </div>
            </section>

            <section className="room-detail-section">
              <p className="eyebrow">THOUGHTFUL EXTRAS</p>
              <h2>Room amenities</h2>
              <ul className="room-amenity-grid">
                {(room.amenities || []).map((amenity) => (
                  <li key={amenity}><span aria-hidden="true">✓</span>{amenity}</li>
                ))}
              </ul>
            </section>

            <section className="room-detail-section">
              <p className="eyebrow">GOOD TO KNOW</p>
              <h2>Highlights &amp; access</h2>
              <ul className="room-highlight-list">
                {(room.highlights || []).map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
              <div className="room-access-note">
                <strong>Accessibility</strong>
                <p>{room.accessibility}</p>
              </div>
            </section>

            <section className="room-detail-section room-policies" id="policies">
              <p className="eyebrow">PLAN YOUR STAY</p>
              <h2>Policies &amp; practical details</h2>
              <dl>
                <div><dt>Check-in</dt><dd>{policies.checkIn || "Confirm with property"}</dd></div>
                <div><dt>Check-out</dt><dd>{policies.checkOut || "Confirm with property"}</dd></div>
                <div><dt>Meal plan</dt><dd>{room.mealPlan || "Confirm with property"}</dd></div>
                <div><dt>Minimum stay</dt><dd>{policies.minStayNights || 1} night{policies.minStayNights === 1 ? "" : "s"}</dd></div>
                <div><dt>Maximum stay</dt><dd>{policies.maxStayNights || "No limit"}{policies.maxStayNights ? " nights" : ""}</dd></div>
                {room.floor && <div><dt>Location</dt><dd>{room.floor}</dd></div>}
                <div><dt>Cancellation</dt><dd>{policies.cancellation || "Contact the property for details."}</dd></div>
                <div><dt>Children</dt><dd>{policies.children || "Contact the property for details."}</dd></div>
                <div><dt>Smoking</dt><dd>{policies.smokingAllowed ? "Allowed in designated areas" : "Non-smoking room"}</dd></div>
                <div><dt>Pets</dt><dd>{policies.petsAllowed ? "Pets accepted; confirm with property" : "Pets are not accepted"}</dd></div>
                <div><dt>Extra bed</dt><dd>{policies.extraBedAvailable ? "Available on request, subject to confirmation" : "Not available in this room"}</dd></div>
                <div><dt>Taxes &amp; fees</dt><dd>{room.taxesAndFees ? `${formatPrice({ ...room, price: room.taxesAndFees })} per night` : "Included or confirmed before booking"}</dd></div>
              </dl>
            </section>
          </div>

          <aside className="room-booking-card">
            <p className="eyebrow">YOUR ROOM, YOUR PACE</p>
            <p className="hotel-price"><strong>{formatPrice(room)}</strong><span> / night</span></p>
            <p className="room-booking-capacity">Up to {room.capacity} guests · {room.sizeSqm} m²</p>
            <div className="room-availability">
              <span className="availability-dot" aria-hidden="true" />
              {room.availableRooms > 0
                ? `${room.availableRooms} rooms currently available`
                : "Ask us about availability"}
            </div>
            <RoomRequestButton className="search-button room-booking-action" room={room} />
            <small>A request is not a confirmed reservation. Availability and final pricing will be confirmed by the property.</small>
          </aside>
        </div>
      </article>
    </PageShell>
  );
}
