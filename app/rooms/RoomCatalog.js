"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoomRequestButton from "../components/RoomRequestButton";
import { rooms as seedRooms } from "../../lib/rooms";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function normalizeRoom(room) {
  const id = room.roomId || room.id;
  return {
    ...room,
    id,
    roomId: id,
    type: room.roomType || room.type,
    image: room.images?.[0] || room.image,
    imageAlt: room.imageAlt || `${room.name} at ${room.hotelName}`
  };
}

function formatPrice(room) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: room.currency || "USD",
    maximumFractionDigits: 0
  }).format(room.price);
}

export default function RoomCatalog() {
  const [rooms, setRooms] = useState(seedRooms);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All rooms");

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/rooms`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn't load the rooms.");
        if (active) setRooms(data.rooms.map(normalizeRoom));
      })
      .catch(() => {
        if (active) setRooms(seedRooms);
      });
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ["All rooms", ...new Set(rooms.map((room) => room.category).filter(Boolean))],
    [rooms]
  );
  const visibleRooms = rooms.filter((room) => {
    const matchesCategory = category === "All rooms" || room.category === category;
    const searchable = `${room.name} ${room.hotelName} ${room.location} ${room.view || ""}`.toLowerCase();
    return matchesCategory && searchable.includes(query.trim().toLowerCase());
  });

  return (
    <section className="listing-section content-width" id="all-rooms">
      <div className="room-catalog-toolbar">
        <div>
          <p className="eyebrow">A GOOD PLACE TO BEGIN</p>
          <h2>Rooms worth coming back to</h2>
        </div>
        <span className="listing-count">{rooms.length} considered stays</span>
      </div>
      <div className="room-filters">
        <label className="room-filter-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms, stays, or views"
            aria-label="Search rooms, stays, or views"
          />
        </label>
        <label className="room-filter-category">
          <span className="visually-hidden">Room category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      {visibleRooms.length ? (
        <div className="room-grid">
          {visibleRooms.map((room) => (
            <article className="editorial-card room-card" key={room.id}>
              <Link className="editorial-card-image" href={`/rooms/${room.id}`}>
                <img src={room.image} alt={room.imageAlt} loading="lazy" />
                <span className="editorial-image-tag">{room.name}</span>
              </Link>
              <div className="editorial-card-content">
                <p className="editorial-meta">{room.location} · {room.category}</p>
                <h3><Link href={`/rooms/${room.id}`}>{room.hotelName}</Link></h3>
                <p className="editorial-description">
                  {room.shortDescription || room.type} · Sleeps {room.capacity}
                </p>
                <div className="editorial-card-bottom">
                  <p><strong>{formatPrice(room)}</strong> <span>/ night</span></p>
                  <Link className="editorial-arrow-link" href={`/rooms/${room.id}`} aria-label={`View ${room.name} details`}>↗</Link>
                </div>
                <RoomRequestButton className="hotel-book-link room-request-link" room={room} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <span aria-hidden="true">✳</span>
          <h3>No matching rooms</h3>
          <p>Try a different search or category.</p>
        </div>
      )}
    </section>
  );
}
