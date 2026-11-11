"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoomRequestButton from "./RoomRequestButton";
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

export default function HotelRoomList({ hotelId }) {
  const [rooms, setRooms] = useState(
    seedRooms.filter((room) => room.hotelId === hotelId)
  );

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/rooms?hotelId=${encodeURIComponent(hotelId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn't load room inventory.");
        if (active) setRooms(data.rooms.map(normalizeRoom));
      })
      .catch(() => {
        if (active) setRooms(seedRooms.filter((room) => room.hotelId === hotelId));
      });
    return () => { active = false; };
  }, [hotelId]);

  return (
    <div className="hotel-room-list">
      {rooms.length ? rooms.map((room) => (
        <article className="detail-room-card" key={room.id}>
          <Link href={`/rooms/${room.id}`} aria-label={`View ${room.name} room details`}>
            <img src={room.image} alt={room.imageAlt} loading="lazy" />
          </Link>
          <div>
            <p className="editorial-meta">{room.type}</p>
            <h3><Link href={`/rooms/${room.id}`}>{room.name}</Link></h3>
            <p className="editorial-meta">Sleeps up to {room.capacity} · {room.sizeSqm} m² · {room.category}</p>
            <Link className="room-inline-details" href={`/rooms/${room.id}`}>Full room details <span aria-hidden="true">↗</span></Link>
          </div>
          <p className="hotel-price"><strong>{formatPrice(room)}</strong><span> / night</span></p>
          <RoomRequestButton className="hotel-book-link room-detail-request" room={room} />
        </article>
      )) : (
        <p className="hotel-rooms-empty">No rooms are currently listed for this property.</p>
      )}
    </div>
  );
}
