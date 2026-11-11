"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CalendarField, { getToday, shiftDate } from "./CalendarField";
import RoomRequestButton from "./RoomRequestButton";
import GuestPicker from "./GuestPicker";
import { rooms } from "../../lib/rooms";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

export default function HotelFinder({ initialHotels }) {
  const [hotels, setHotels] = useState(initialHotels);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [searchMessage, setSearchMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [favoriteHotelIds, setFavoriteHotelIds] = useState(() => new Set());

  const visibleHotels = useMemo(() => {
    if (!searchMessage.startsWith("Live search unavailable")) return hotels;
    const query = destination.trim().toLowerCase();
    return query
      ? initialHotels.filter((hotel) =>
          `${hotel.name} ${hotel.location} ${hotel.category}`
            .toLowerCase()
            .includes(query)
        )
      : initialHotels;
  }, [destination, hotels, initialHotels, searchMessage]);

  async function searchStays(event) {
    event.preventDefault();
    setSearching(true);
    setSearchMessage("");
    const params = new URLSearchParams({
      destination: destination.trim(),
      guests
    });
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);

    try {
      const response = await fetch(`${apiBase}/api/hotels?${params}`);
      if (!response.ok) {
        throw new Error(`Search failed (${response.status}). Please try again.`);
      }
      const data = await response.json();
      setHotels(data.hotels);
      setSearchMessage(
        `${data.count} ${data.count === 1 ? "stay" : "stays"} to discover`
      );
    } catch (error) {
      setHotels(initialHotels);
      setSearchMessage(
        "Live search unavailable — showing our handpicked stays instead."
      );
    } finally {
      setSearching(false);
    }
  }

  function toggleFavorite(hotelId) {
    setFavoriteHotelIds((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites);
      if (nextFavorites.has(hotelId)) {
        nextFavorites.delete(hotelId);
      } else {
        nextFavorites.add(hotelId);
      }
      return nextFavorites;
    });
  }

  return (
    <>
      <div className="search-card content-width">
        <div className="search-heading">
          <div>
            <p className="eyebrow">MAKE YOURSELF AT HOME</p>
            <h2>Find your next stay</h2>
          </div>
          <span className="search-note">
            <span aria-hidden="true">✳</span> Only the good places
          </span>
        </div>
        <form className="search-form" onSubmit={searchStays}>
          <label className="search-field destination-field">
            <span className="field-icon" aria-hidden="true">⌖</span>
            <span className="field-content">
              <span className="field-label">WHERE TO?</span>
              <input
                type="search"
                name="destination"
                placeholder="City, hotel, or region"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                aria-label="Destination"
              />
            </span>
          </label>
          <label className="search-field">
            <span className="field-icon calendar-icon" aria-hidden="true">▦</span>
            <span className="field-content">
              <span className="field-label">CHECK IN</span>
              <CalendarField
                value={checkIn}
                onChange={(nextDate) => {
                  setCheckIn(nextDate);
                  if (checkOut && nextDate && checkOut <= nextDate) setCheckOut("");
                }}
                ariaLabel="Check-in date"
                minDate={getToday()}
              />
            </span>
          </label>
          <label className="search-field">
            <span className="field-icon calendar-icon" aria-hidden="true">▦</span>
            <span className="field-content">
              <span className="field-label">CHECK OUT</span>
              <CalendarField
                value={checkOut}
                onChange={setCheckOut}
                ariaLabel="Check-out date"
                minDate={shiftDate(checkIn || getToday(), 1)}
              />
            </span>
          </label>
          <div className="search-field guest-field">
            <span className="field-icon guest-icon" aria-hidden="true">♙</span>
            <span className="field-content">
              <span className="field-label">WHO&apos;S COMING?</span>
              <GuestPicker value={guests} onChange={setGuests} />
            </span>
          </div>
          <button className="search-button" type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search stays"}
            {!searching && <span aria-hidden="true">↗</span>}
          </button>
        </form>
      </div>

      <section className="stays-section content-width" aria-labelledby="stays-title">
        <div className="section-heading stays-heading">
          <div>
            <p className="eyebrow">A FEW PLACES WE LOVE</p>
            <h2 id="stays-title">Stays worth staying for</h2>
          </div>
          <span className="curated-label">
            <span aria-hidden="true">✦</span> THE CURATED EDIT
          </span>
        </div>
        {searchMessage && (
          <p className="search-status" role="status">{searchMessage}</p>
        )}
        {visibleHotels.length > 0 ? (
          <div className="hotel-grid">
            {visibleHotels.map((hotel) => (
              <article className="hotel-card" key={hotel.id}>
                <div className="hotel-image-wrap">
                  <img
                    className="hotel-image"
                    src={hotel.image}
                    alt={hotel.imageAlt}
                    loading="lazy"
                  />
                  <span className="hotel-category">{hotel.category}</span>
                  <button
                    className="favorite-button"
                    type="button"
                    aria-label={`${favoriteHotelIds.has(hotel.id) ? "Remove" : "Save"} ${hotel.name} ${favoriteHotelIds.has(hotel.id) ? "from" : "to"} favorites`}
                    aria-pressed={favoriteHotelIds.has(hotel.id)}
                    onClick={() => toggleFavorite(hotel.id)}
                  >
                    {favoriteHotelIds.has(hotel.id) ? "♥" : "♡"}
                  </button>
                </div>
                <div className="hotel-info">
                  <div className="hotel-title-row">
                    <div>
                      <p className="hotel-location">{hotel.location}</p>
                      <h3><Link href={`/stays/${hotel.id}`}>{hotel.name}</Link></h3>
                    </div>
                    <span className="hotel-rating">
                      <span aria-hidden="true">★</span> {hotel.rating}
                    </span>
                  </div>
                  <div className="hotel-bottom-row">
                    <p className="review-count">{hotel.reviews} thoughtful reviews</p>
                    <p className="hotel-price">
                      <strong>{formatPrice(hotel.price)}</strong>
                      <span> / night</span>
                    </p>
                  </div>
                  <RoomRequestButton
                    className="hotel-book-link"
                    room={rooms.find((room) => room.hotelId === hotel.id)}
                  />
                  <Link className="hotel-detail-link" href={`/stays/${hotel.id}`}>
                    Explore this stay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <span aria-hidden="true">✳</span>
            <h3>No stays found just yet</h3>
            <p>Try a nearby destination or explore our curated collection.</p>
          </div>
        )}
      </section>

    </>
  );
}
