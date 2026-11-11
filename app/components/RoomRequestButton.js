"use client";

import { useState } from "react";
import CalendarField, { getToday, shiftDate } from "./CalendarField";
import GuestPicker from "./GuestPicker";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const roomCategories = ["Standard", "Deluxe", "Suite", "Villa", "Residence"];

function getDefaultCategory(roomName, category) {
  if (roomCategories.includes(category)) return category;
  const name = roomName.toLowerCase();
  if (name.includes("villa") || name.includes("residence")) return "Villa";
  if (name.includes("suite")) return "Suite";
  if (name.includes("deluxe")) return "Deluxe";
  return "Standard";
}

export default function RoomRequestButton({ room, className = "search-button" }) {
  const [open, setOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(String(Math.min(2, room.capacity)));
  const [roomCategory, setRoomCategory] = useState(getDefaultCategory(room.name, room.category));
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openRequest() {
    setCheckIn("");
    setCheckOut("");
    setGuests(String(Math.min(2, room.capacity)));
    setRoomCategory(getDefaultCategory(room.name, room.category));
    setBooking(null);
    setBookingError("");
    setOpen(true);
  }

  async function requestBooking(event) {
    event.preventDefault();
    setBookingError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const reservation = {
      hotelId: room.hotelId,
      roomId: room.id,
      guestName: formData.get("guestName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      roomCategory: formData.get("roomCategory"),
      checkIn: formData.get("bookingCheckIn"),
      checkOut: formData.get("bookingCheckOut"),
      guests: Number(formData.get("bookingGuests"))
    };

    try {
      const response = await fetch(`${apiBase}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "We couldn't send your request. Please try again.");
      }
      setBooking(data.booking);
    } catch (error) {
      setBookingError(
        error.message === "Failed to fetch"
          ? "Booking service is unavailable right now. Please try again in a moment."
          : error.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className={className} type="button" onClick={openRequest}>
        Request this room <span aria-hidden="true">↗</span>
      </button>
      {open && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-request-title"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close room request"
            >
              ×
            </button>
            {booking ? (
              <div className="booking-success" role="status">
                <span className="success-mark" aria-hidden="true">✓</span>
                <p className="eyebrow">A LOVELY PLACE TO START</p>
                <h2 id="room-request-title">Request received</h2>
                <p>
                  Your request for {booking.room} at {booking.hotel} has been
                  saved as a {booking.roomCategory} category request. Our team
                  will follow up to confirm availability.
                </p>
                <p className="booking-reference">
                  Reference <strong>{booking.reference}</strong>
                </p>
                <button
                  className="search-button modal-submit"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Back to exploring
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">MAKE IT YOURS</p>
                <h2 id="room-request-title">Request this room</h2>
                <p className="booking-property">
                  {room.name} <span>·</span> {room.hotelName}
                </p>
                <form className="booking-form" onSubmit={requestBooking}>
                  <label>
                    Your name
                    <input
                      name="guestName"
                      autoComplete="name"
                      placeholder="Your full name"
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      maxLength={254}
                      required
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      inputMode="tel"
                      pattern="\+?[0-9\s().-]{7,25}"
                      title="Enter a phone number with 7 to 15 digits."
                      maxLength={25}
                      required
                    />
                  </label>
                  <label>
                    Room category
                    <select
                      name="roomCategory"
                      value={roomCategory}
                      onChange={(event) => setRoomCategory(event.target.value)}
                      required
                    >
                      {roomCategories.map((category) => (
                        <option value={category} key={category}>
                          {category}{category === getDefaultCategory(room.name, room.category) ? " · selected room" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="booking-dates">
                    <label>
                      Check in
                      <CalendarField
                        name="bookingCheckIn"
                        value={checkIn}
                        onChange={(nextDate) => {
                          setCheckIn(nextDate);
                          if (checkOut && nextDate && checkOut <= nextDate) {
                            setCheckOut("");
                          }
                        }}
                        ariaLabel="Booking check-in date"
                        minDate={getToday()}
                        required
                      />
                    </label>
                    <label>
                      Check out
                      <CalendarField
                        name="bookingCheckOut"
                        value={checkOut}
                        onChange={setCheckOut}
                        ariaLabel="Booking check-out date"
                        minDate={shiftDate(checkIn || getToday(), 1)}
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Guests
                    <GuestPicker
                      value={guests}
                      onChange={setGuests}
                      maxGuests={room.capacity}
                      name="bookingGuests"
                    />
                  </label>
                  {bookingError && (
                    <p className="booking-error" role="alert">{bookingError}</p>
                  )}
                  <button
                    className="search-button modal-submit"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Sending request..." : "Send room request"}
                    {!submitting && <span aria-hidden="true">↗</span>}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
