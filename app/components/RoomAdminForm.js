"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hotels } from "../../lib/hotels";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const emptyRoom = {
  hotelId: hotels[0].id,
  name: "",
  category: "",
  mealPlan: "",
  roomType: "",
  shortDescription: "",
  description: "",
  capacity: "",
  adults: "",
  children: "0",
  bedrooms: "1",
  bathrooms: "1",
  beds: [],
  sizeSqm: "",
  price: "",
  currency: "USD",
  taxesAndFees: "0",
  roomCount: "",
  availableRooms: "",
  view: "",
  floor: "",
  amenities: [],
  highlights: [],
  images: [],
  accessibility: "",
  isActive: true,
  policies: {
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    cancellation: "",
    children: "",
    minStayNights: "1",
    maxStayNights: "30",
    smokingAllowed: false,
    petsAllowed: false,
    extraBedAvailable: false
  }
};

function toFormRoom(room) {
  return {
    ...emptyRoom,
    ...room,
    capacity: String(room.capacity ?? ""),
    adults: String(room.adults ?? ""),
    children: String(room.children ?? 0),
    bedrooms: String(room.bedrooms ?? 1),
    bathrooms: String(room.bathrooms ?? 1),
    sizeSqm: String(room.sizeSqm ?? ""),
    price: String(room.price ?? ""),
    taxesAndFees: String(room.taxesAndFees ?? 0),
    roomCount: String(room.roomCount ?? ""),
    availableRooms: String(room.availableRooms ?? ""),
    isActive: room.isActive !== false,
    beds: room.beds || [],
    amenities: room.amenities || [],
    highlights: room.highlights || [],
    images: room.images?.length ? room.images : [room.image].filter(Boolean),
    policies: { ...emptyRoom.policies, ...room.policies }
  };
}

function splitLines(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function formatList(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export default function RoomAdminForm({ roomId }) {
  const router = useRouter();
  const editing = Boolean(roomId);
  const [values, setValues] = useState(emptyRoom);
  const [bedsText, setBedsText] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState(hotels);

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/hotels`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn't load available properties.");
        if (active && data.hotels.length) setProperties(data.hotels);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message === "Failed to fetch"
          ? "The property list could not be refreshed. Check that the server is running."
          : loadError.message);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!roomId) return undefined;
    let active = true;
    fetch(`${apiBase}/api/admin/rooms`, { credentials: "include" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn't load the room to edit.");
        const room = data.rooms.find((item) => item.roomId === roomId);
        if (!room) throw new Error("This room doesn't exist in the inventory.");
        if (!active) return;
        const nextValues = toFormRoom(room);
        setValues(nextValues);
        setBedsText(nextValues.beds.map((bed) => `${bed.type}: ${bed.count}`).join("\n"));
        setAmenitiesText(formatList(nextValues.amenities));
        setHighlightsText(formatList(nextValues.highlights));
        setImagesText(formatList(nextValues.images));
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [roomId]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updatePolicy(event) {
    const { name, value, checked, type } = event.target;
    setValues((current) => ({
      ...current,
      policies: {
        ...current.policies,
        [name]: type === "checkbox" ? checked : value
      }
    }));
  }

  async function submitRoom(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const beds = bedsText.split("\n").map((line) => {
      const [type, count = "1"] = line.split(":");
      return { type: type.trim(), count: Number(count.trim()) };
    }).filter((bed) => bed.type);
    const payload = {
      ...values,
      capacity: Number(values.capacity),
      adults: Number(values.adults),
      children: Number(values.children),
      bedrooms: Number(values.bedrooms),
      bathrooms: Number(values.bathrooms),
      sizeSqm: Number(values.sizeSqm),
      price: Number(values.price),
      taxesAndFees: Number(values.taxesAndFees),
      roomCount: Number(values.roomCount),
      availableRooms: Number(values.availableRooms),
      policies: {
        ...values.policies,
        minStayNights: Number(values.policies.minStayNights),
        maxStayNights: Number(values.policies.maxStayNights)
      },
      beds,
      amenities: splitLines(amenitiesText),
      highlights: splitLines(highlightsText),
      images: splitLines(imagesText)
    };

    try {
      const response = await fetch(
        `${apiBase}/api/admin/rooms${editing ? `/${encodeURIComponent(roomId)}` : ""}`,
        {
          method: editing ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Couldn't save this room.");
      router.push("/dashboard/rooms");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message === "Failed to fetch"
        ? "The management API is unavailable. Check that the server is running."
        : saveError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-page">
        <div className="admin-layout admin-form-layout">
          <aside className="admin-sidebar">
            <Link className="admin-sidebar-brand" href="/dashboard/rooms">
              <span className="brand-mark" aria-hidden="true">C</span>
              <span>STAY MANAGEMENT<small>COX&apos;S HOLIDAY STAY</small></span>
            </Link>
            <p className="admin-sidebar-label">WORKSPACE</p>
            <nav aria-label="Management navigation">
              <Link href="/dashboard"><span aria-hidden="true">⌂</span> Overview</Link>
              <Link href="/dashboard/bookings"><span aria-hidden="true">▣</span> Booking requests</Link>
              <Link href="/dashboard/properties"><span aria-hidden="true">⌖</span> Properties</Link>
              <Link className="is-current" href="/dashboard/rooms"><span aria-hidden="true">▦</span> Rooms &amp; inventory</Link>
              <Link href="/dashboard/users"><span aria-hidden="true">♙</span> Users &amp; guests</Link>
              <Link href="/rooms"><span aria-hidden="true">↗</span> View guest catalog</Link>
            </nav>
            <div className="admin-sidebar-help">
              <span aria-hidden="true">✦</span>
              <strong>Good details make a great stay.</strong>
              <p>Complete, accurate room information helps guests choose with confidence.</p>
            </div>
          </aside>
          <section className="admin-main">
            <div className="admin-topline">
              <div><p className="eyebrow">PROPERTY WORKSPACE</p><p className="admin-breadcrumb"><Link href="/dashboard/rooms">Rooms &amp; inventory</Link> <span>/</span> {editing ? "Edit room" : "Add a room"}</p></div>
              <Link className="admin-view-site" href="/">View website <span aria-hidden="true">↗</span></Link>
            </div>
            <header className="admin-page-heading admin-form-heading">
              <div>
                <p className="eyebrow">{editing ? "KEEP THE DETAILS CURRENT" : "CREATE A THOUGHTFUL LISTING"}</p>
                <h1>{editing ? "Edit room details" : "Add a room"}</h1>
                <p>Share the full picture: from the sleeping setup and amenities to pricing and house policies.</p>
              </div>
              <Link className="admin-secondary-button" href="/dashboard/rooms">Cancel</Link>
            </header>

            {error && <div className="admin-error form-error" role="alert">{error}<Link href="/login">Sign in <span aria-hidden="true">↗</span></Link></div>}
            {loading ? (
              <div className="admin-empty-state" role="status">Loading room details…</div>
            ) : (
              <form className="room-admin-form" onSubmit={submitRoom}>
                <section className="admin-form-section">
                  <div className="admin-form-section-heading"><span>01</span><div><h2>Room identity</h2><p>Give guests a clear introduction to this room.</p></div></div>
                  <div className="admin-form-grid">
                    <label className="admin-field admin-field-full">Property
                      <select name="hotelId" value={values.hotelId} onChange={updateField} required>
                        {properties.map((hotel) => <option value={hotel.id} key={hotel.id}>{hotel.name} · {hotel.location}</option>)}
                      </select>
                    </label>
                    <label className="admin-field">Room name
                      <input name="name" value={values.name} onChange={updateField} placeholder="e.g. Ocean View King Suite" minLength={3} maxLength={120} required />
                    </label>
                    <label className="admin-field">Category
                      <select name="category" value={values.category} onChange={updateField} required>
                        <option value="" disabled>Select room category</option>
                        {["Standard", "Deluxe", "Suite", "Villa", "Residence"].map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="admin-field">Meal plan
                      <select name="mealPlan" value={values.mealPlan} onChange={updateField} required>
                        <option value="" disabled>Select meal plan</option>
                        {["Room only", "Breakfast included", "Half board", "Full board", "All inclusive"].map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="admin-field admin-field-full">Room type and bed description
                      <input name="roomType" value={values.roomType} onChange={updateField} placeholder="e.g. King bed · private balcony · sea view" maxLength={120} required />
                    </label>
                    <label className="admin-field admin-field-full">Short description
                      <input name="shortDescription" value={values.shortDescription} onChange={updateField} placeholder="A concise summary guests see in search results" maxLength={240} required />
                    </label>
                    <label className="admin-field admin-field-full">Full room description
                      <textarea name="description" value={values.description} onChange={updateField} placeholder="Describe the layout, atmosphere, furnishings, view, and what makes this room special." minLength={30} maxLength={5000} rows={5} required />
                      <small>{values.description.length}/5000 characters</small>
                    </label>
                  </div>
                </section>

                <section className="admin-form-section">
                  <div className="admin-form-section-heading"><span>02</span><div><h2>Occupancy &amp; layout</h2><p>Help guests understand the room's size and sleeping arrangement.</p></div></div>
                  <div className="admin-form-grid admin-form-grid-4">
                    <label className="admin-field">Max guests<input type="number" name="capacity" value={values.capacity} onChange={updateField} placeholder="2" min="1" max="6" required /></label>
                    <label className="admin-field">Adults<input type="number" name="adults" value={values.adults} onChange={updateField} placeholder="2" min="1" max="6" required /></label>
                    <label className="admin-field">Children<input type="number" name="children" value={values.children} onChange={updateField} placeholder="0" min="0" max="5" required /></label>
                    <label className="admin-field">Room size (m²)<input type="number" name="sizeSqm" value={values.sizeSqm} onChange={updateField} placeholder="42" min="1" max="10000" step="0.5" required /></label>
                    <label className="admin-field">Bedrooms<input type="number" name="bedrooms" value={values.bedrooms} onChange={updateField} placeholder="1" min="0" max="20" required /></label>
                    <label className="admin-field">Bathrooms<input type="number" name="bathrooms" value={values.bathrooms} onChange={updateField} placeholder="1" min="1" max="20" required /></label>
                    <label className="admin-field admin-field-wide">Room view<input name="view" value={values.view} onChange={updateField} placeholder="e.g. Ocean, garden, city skyline" maxLength={120} required /></label>
                    <label className="admin-field admin-field-wide">Floor / building location<input name="floor" value={values.floor} onChange={updateField} placeholder="e.g. 3rd floor · west wing (optional)" maxLength={60} /></label>
                    <label className="admin-field admin-field-full">Beds <span className="admin-field-hint">One per line, in “Bed type: quantity” format.</span>
                      <textarea value={bedsText} onChange={(event) => setBedsText(event.target.value)} placeholder={"King: 1\nSofa bed: 1"} rows={3} required />
                    </label>
                  </div>
                </section>

                <section className="admin-form-section">
                  <div className="admin-form-section-heading"><span>03</span><div><h2>Pricing &amp; availability</h2><p>Set the nightly rate, included charges, and physical room inventory.</p></div></div>
                  <div className="admin-form-grid admin-form-grid-4">
                    <label className="admin-field">Nightly rate<input type="number" name="price" value={values.price} onChange={updateField} placeholder="180" min="0" max="1000000" step="0.01" required /></label>
                    <label className="admin-field">Currency
                      <select name="currency" value={values.currency} onChange={updateField} required>
                        {["USD", "EUR", "GBP", "BDT", "AED", "THB", "IDR", "MVR"].map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="admin-field">Taxes &amp; fees / night<input type="number" name="taxesAndFees" value={values.taxesAndFees} onChange={updateField} placeholder="0" min="0" max="1000000" step="0.01" required /></label>
                    <label className="admin-field">Total room units<input type="number" name="roomCount" value={values.roomCount} onChange={updateField} placeholder="4" min="1" max="10000" required /></label>
                    <label className="admin-field">Available units<input type="number" name="availableRooms" value={values.availableRooms} onChange={updateField} placeholder="3" min="0" max="10000" required /></label>
                  </div>
                </section>

                <section className="admin-form-section">
                  <div className="admin-form-section-heading"><span>04</span><div><h2>Photos &amp; room features</h2><p>Share room photos and the amenities guests can expect.</p></div></div>
                  <div className="admin-form-grid">
                    <label className="admin-field admin-field-full">Room photo URLs <span className="admin-field-hint">One public HTTPS image URL per line. The first is used as the cover photo.</span>
                      <textarea value={imagesText} onChange={(event) => setImagesText(event.target.value)} placeholder="https://images.example.com/your-room.jpg" rows={3} required />
                    </label>
                    <label className="admin-field admin-field-full">Amenities <span className="admin-field-hint">One amenity per line.</span>
                      <textarea value={amenitiesText} onChange={(event) => setAmenitiesText(event.target.value)} placeholder={"Free Wi-Fi\nAir conditioning\nCoffee and tea maker"} rows={5} required />
                    </label>
                    <label className="admin-field admin-field-full">Room highlights <span className="admin-field-hint">One guest-facing feature per line.</span>
                      <textarea value={highlightsText} onChange={(event) => setHighlightsText(event.target.value)} placeholder={"Private balcony\nDirect beach access"} rows={3} required />
                    </label>
                    <label className="admin-field admin-field-full">Accessibility information
                      <textarea name="accessibility" value={values.accessibility} onChange={updateField} placeholder="Describe step-free routes, lifts, bathroom access, and any limitations. Be specific." maxLength={500} rows={3} required />
                    </label>
                  </div>
                </section>

                <section className="admin-form-section">
                  <div className="admin-form-section-heading"><span>05</span><div><h2>Policies &amp; practical details</h2><p>Set expectations before a guest sends a stay request.</p></div></div>
                  <div className="admin-form-grid">
                    <label className="admin-field">Check-in time<input name="checkIn" value={values.policies.checkIn} onChange={updatePolicy} placeholder="3:00 PM" maxLength={30} required /></label>
                    <label className="admin-field">Check-out time<input name="checkOut" value={values.policies.checkOut} onChange={updatePolicy} placeholder="11:00 AM" maxLength={30} required /></label>
                    <label className="admin-field">Minimum stay (nights)<input type="number" name="minStayNights" value={values.policies.minStayNights} onChange={updatePolicy} placeholder="1" min="1" max="365" required /></label>
                    <label className="admin-field">Maximum stay (nights)<input type="number" name="maxStayNights" value={values.policies.maxStayNights} onChange={updatePolicy} placeholder="30" min="1" max="365" required /></label>
                    <label className="admin-field admin-field-full">Cancellation policy<textarea name="cancellation" value={values.policies.cancellation} onChange={updatePolicy} placeholder="Explain free cancellation deadlines, fees, and no-show terms." maxLength={1000} rows={3} required /></label>
                    <label className="admin-field admin-field-full">Children &amp; extra guest policy<textarea name="children" value={values.policies.children} onChange={updatePolicy} placeholder="Describe child age limits, cot options, and any extra person charges." maxLength={500} rows={3} required /></label>
                    <div className="admin-check-grid">
                      <label><input type="checkbox" name="smokingAllowed" checked={values.policies.smokingAllowed} onChange={updatePolicy} /><span><strong>Smoking allowed</strong><small>Mark only if permitted in this room.</small></span></label>
                      <label><input type="checkbox" name="petsAllowed" checked={values.policies.petsAllowed} onChange={updatePolicy} /><span><strong>Pets allowed</strong><small>Guests may request to bring a pet.</small></span></label>
                      <label><input type="checkbox" name="extraBedAvailable" checked={values.policies.extraBedAvailable} onChange={updatePolicy} /><span><strong>Extra bed available</strong><small>Subject to confirmation by the property.</small></span></label>
                      <label><input type="checkbox" name="isActive" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} /><span><strong>Accepting room requests</strong><small>Turn off to archive this room from the guest catalog.</small></span></label>
                    </div>
                  </div>
                </section>

                <div className="admin-form-actions">
                  <Link className="admin-secondary-button" href="/dashboard/rooms">Cancel</Link>
                  <button className="admin-primary-button" type="submit" disabled={submitting}>
                    {submitting ? "Saving room…" : editing ? "Save room details" : "Add room to catalog"}
                    {!submitting && <span aria-hidden="true">↗</span>}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
    </main>
  );
}
