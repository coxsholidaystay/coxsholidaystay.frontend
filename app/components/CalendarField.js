"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDateValue(new Date());
}

function shiftDate(value, days) {
  const date = parseDate(value);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return formatDateValue(date);
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function getCalendarDays(month) {
  const firstDay = monthStart(month);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function CalendarField({
  value,
  onChange,
  ariaLabel,
  name,
  minDate = getToday(),
  required = false
}) {
  const inputRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthStart(parseDate(value) || parseDate(minDate) || new Date()));
  const [position, setPosition] = useState(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(getToday());
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      const bounds = inputRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const width = Math.min(300, window.innerWidth - 24);
      const left = Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12));
      const below = window.innerHeight - bounds.bottom;
      const top = below >= 350 || bounds.top < 350
        ? bounds.bottom + 8
        : Math.max(12, bounds.top - 350 - 8);
      setPosition({ left, top, width });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    function closeOutside(event) {
      if (
        !inputRef.current?.contains(event.target) &&
        !popoverRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) setMonth(monthStart(parseDate(value) || parseDate(minDate) || new Date()));
  }, [minDate, open, value]);

  function chooseDate(date) {
    onChange(formatDateValue(date));
    setOpen(false);
    inputRef.current?.focus();
  }

  const selectedDate = parseDate(value);
  const days = getCalendarDays(month);
  const calendar = open && typeof document !== "undefined" ? createPortal(
    <div
      className="calendar-popover"
      ref={popoverRef}
      role="dialog"
      aria-label={`Choose ${ariaLabel.toLowerCase()}`}
      style={position ? {
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${position.width}px`
      } : { visibility: "hidden" }}
    >
      <div className="calendar-heading">
        <button
          className="calendar-month-button"
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          aria-label="Previous month"
        >‹</button>
        <strong>{monthLabel(month)}</strong>
        <button
          className="calendar-month-button"
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Next month"
        >›</button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days" role="grid" aria-label={monthLabel(month)}>
        {days.map((date) => {
          const dateValue = formatDateValue(date);
          const outsideMonth = date.getMonth() !== month.getMonth();
          const isSelected = dateValue === value;
          const isToday = dateValue === today;
          const disabled = Boolean(minDate && dateValue < minDate);
          return (
            <button
              className={`calendar-day${outsideMonth ? " is-outside" : ""}${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
              type="button"
              role="gridcell"
              key={dateValue}
              disabled={disabled}
              aria-label={new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
              }).format(date)}
              aria-pressed={isSelected}
              onClick={() => chooseDate(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="calendar-footer">
        <button type="button" onClick={() => { onChange(""); setOpen(false); inputRef.current?.focus(); }}>Clear</button>
        <button type="button" onClick={() => chooseDate(parseDate(today && today >= minDate ? today : minDate))}>Today</button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <span className="calendar-field">
      <input
        ref={inputRef}
        className="calendar-input"
        type="text"
        value={selectedDate ? dateFormatter.format(selectedDate) : ""}
        placeholder="Select a date"
        readOnly
        required={required}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
      {name && <input type="hidden" name={name} value={value || ""} />}
      <button
        className="calendar-trigger"
        type="button"
        onClick={() => {
          inputRef.current?.focus();
          setOpen((current) => !current);
        }}
        aria-label={`Open ${ariaLabel.toLowerCase()} calendar`}
        aria-expanded={open}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <rect x="3" y="5" width="14" height="12" rx="1.5" />
          <path d="M6.5 3.5v3M13.5 3.5v3M3 8.5h14" />
        </svg>
      </button>
      {calendar}
    </span>
  );
}

export { getToday, shiftDate };
