"use client";

import { useEffect, useRef, useState } from "react";

export default function GuestPicker({ value, onChange, maxGuests = 6, name }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const guestCount = Number(value);

  useEffect(() => {
    if (!open) return undefined;

    function closeOutside(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <span className="guest-picker" ref={containerRef}>
      <button
        className="guest-picker-trigger"
        type="button"
        aria-label={`${guestCount} ${guestCount === 1 ? "guest" : "guests"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{guestCount} {guestCount === 1 ? "guest" : "guests"}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <span className="guest-picker-popover" role="dialog" aria-label="Choose number of guests">
          <span className="guest-picker-heading">
            <strong>Guests</strong>
            <span>Who&apos;s coming along?</span>
          </span>
          <span className="guest-stepper">
            <span className="guest-stepper-label">
              <strong>Guests</strong>
              <span>Up to {maxGuests} guests per stay</span>
            </span>
            <span className="guest-stepper-controls">
              <button
                type="button"
                aria-label="Remove one guest"
                disabled={guestCount <= 1}
                onClick={() => onChange(String(guestCount - 1))}
              >−</button>
              <span aria-live="polite">{guestCount}</span>
              <button
                type="button"
                aria-label="Add one guest"
                disabled={guestCount >= maxGuests}
                onClick={() => onChange(String(guestCount + 1))}
              >+</button>
            </span>
          </span>
          <button
            className="guest-picker-done"
            type="button"
            onClick={() => setOpen(false)}
          >Done</button>
        </span>
      )}
      {name && <input type="hidden" name={name} value={value} />}
    </span>
  );
}
