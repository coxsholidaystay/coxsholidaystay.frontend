"use client";

import { useState } from "react";
import CalendarField, { getToday, shiftDate } from "./CalendarField";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RoomRequestButton({ room, className = "search-button" }) {
  const [open, setOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(String(Math.min(2, room.capacity)));
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openRequest() {
    setCheckIn("");
    setCheckOut("");
    setGuests(String(Math.min(2, room.capacity)));
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
                  saved. Our team will follow up to confirm availability.
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
                      maxLength={254}
                      required
                    />
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
                    <select
                      name="bookingGuests"
                      value={guests}
                      onChange={(event) => setGuests(event.target.value)}
                      required
                    >
                      {Array.from({ length: room.capacity }, (_, index) => index + 1).map((number) => (
                        <option value={number} key={number}>
                          {number} {number === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
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
                  <p className="booking-disclaimer">
                    No login or payment is needed. We&apos;ll contact you by email
                    to confirm availability.
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
