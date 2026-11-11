"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminPageShell from "../components/AdminPageShell";
import { adminRequest, getAdminErrorMessage } from "./adminApi";

const bookingStatusLabels = {
  request_received: "New request",
  contacted: "Contacted",
  confirmed: "Confirmed",
  cancelled: "Cancelled"
};
const bookingStatuses = Object.keys(bookingStatusLabels);

function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="admin-error" role="alert">
      <div>
        <strong>{error}</strong>
        {/admin account|room-management access/i.test(error) && <p>Add your sign-in email to the backend <code>ADMIN_EMAILS</code> setting, then restart the API.</p>}
      </div>
      {/sign in|session|auth|account|access/i.test(error)
        ? <Link href="/login">Sign in ↗</Link>
        : onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}

function StatCards({ items }) {
  return (
    <div className="admin-stats-grid">
      {items.map((item) => (
        <article key={item.label}>
          <span className="admin-stat-icon" aria-hidden="true">{item.icon}</span>
          <p>{item.label}</p>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </article>
      ))}
    </div>
  );
}

function formatDate(value, options = { dateStyle: "medium" }) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "—" : new Intl.DateTimeFormat("en", options).format(date);
}

function statusClass(status) {
  return `admin-status-pill admin-status-${status}`;
}

export function OverviewDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await adminRequest("/overview"));
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  const count = data?.counts;

  return (
    <AdminPageShell active="overview" title="Overview" description="A clear view of guest requests and your stay inventory.">
      <ErrorNotice error={error} onRetry={loadOverview} />
      <StatCards items={[
        { label: "NEW REQUESTS", value: loading || error ? "—" : count.newBookings, note: "Waiting for a follow-up", icon: "▣" },
        { label: "CONFIRMED STAYS", value: loading || error ? "—" : count.confirmedBookings, note: "Bookings marked confirmed", icon: "✓" },
        { label: "ACTIVE ROOMS", value: loading || error ? "—" : count.activeRooms, note: "Room types in the catalog", icon: "▦" },
        { label: "TOTAL REQUESTS", value: loading || error ? "—" : count.totalBookings, note: "Guest enquiries received", icon: "↗" }
      ]} />
      <section className="admin-inventory-panel">
        <div className="admin-panel-heading">
          <div><h2>Recent booking requests</h2><p>Keep new enquiries moving with a timely follow-up.</p></div>
          <Link className="admin-view-site" href="/dashboard/bookings">All requests <span aria-hidden="true">↗</span></Link>
        </div>
        {loading ? <div className="admin-empty-state" role="status">Loading dashboard summary…</div> : error ? null : data.latestBookings.length ? (
          <div className="admin-table-wrap">
            <table className="admin-room-table admin-wide-table">
              <thead><tr><th>GUEST</th><th>PROPERTY / ROOM</th><th>DATES</th><th>RECEIVED</th><th>STATUS</th></tr></thead>
              <tbody>{data.latestBookings.map((booking) => (
                <tr key={booking._id}>
                  <td><strong>{booking.guestName}</strong><span className="admin-cell-secondary">{booking.email}</span></td>
                  <td><strong>{booking.hotelName}</strong><span className="admin-cell-secondary">{booking.roomName || booking.roomCategory}</span></td>
                  <td>{formatDate(booking.checkIn, { month: "short", day: "numeric" })} – {formatDate(booking.checkOut, { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td><span className={statusClass(booking.status)}><span />{bookingStatusLabels[booking.status] || booking.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="admin-empty-state"><span aria-hidden="true">▣</span><h3>No requests yet</h3><p>New room enquiries will appear here as soon as guests send them.</p></div>}
      </section>
      <div className="admin-quick-links">
        <Link href="/dashboard/properties"><span aria-hidden="true">⌖</span><strong>Manage properties</strong><small>{loading || error ? "—" : count.activeProperties} active properties</small></Link>
        <Link href="/dashboard/rooms"><span aria-hidden="true">▦</span><strong>Manage room inventory</strong><small>Update room details and availability</small></Link>
        <Link href="/dashboard/users"><span aria-hidden="true">♙</span><strong>Manage users</strong><small>Review guest accounts and status</small></Link>
      </div>
    </AdminPageShell>
  );
}

export function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest(`/bookings?status=${encodeURIComponent(statusFilter)}`);
      setBookings(result.bookings);
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadBookings(); }, [loadBookings]);
  const visibleBookings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return bookings.filter((booking) =>
      `${booking.reference} ${booking.guestName} ${booking.email} ${booking.phone} ${booking.hotelName} ${booking.roomName || ""}`
        .toLowerCase().includes(search)
    );
  }, [bookings, query]);

  async function updateStatus(booking, status) {
    setUpdating(booking._id);
    setError("");
    try {
      const result = await adminRequest(`/bookings/${encodeURIComponent(booking._id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setBookings((current) => statusFilter === "all"
        ? current.map((item) => item._id === booking._id ? result.booking : item)
        : current.flatMap((item) => {
            if (item._id !== booking._id) return [item];
            return result.booking.status === statusFilter ? [result.booking] : [];
          }));
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setUpdating("");
    }
  }

  return (
    <AdminPageShell active="bookings" title="Booking requests" description="Review guest enquiries, follow up, and keep each request status current.">
      <section className="admin-inventory-panel">
        <div className="admin-panel-heading">
          <div><h2>Guest enquiries</h2><p>Showing the latest 250 requests.</p></div>
          <span className="admin-result-count">{error ? "— requests" : `${visibleBookings.length} requests`}</span>
        </div>
        <div className="admin-table-toolbar">
          <label className="admin-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guest, property, or reference" aria-label="Search booking requests" /></label>
          <label className="admin-filter"><span className="visually-hidden">Booking status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by booking status"><option value="all">All requests</option>{bookingStatuses.map((status) => <option value={status} key={status}>{bookingStatusLabels[status]}</option>)}</select></label>
        </div>
        <ErrorNotice error={error} onRetry={loadBookings} />
        {loading ? <div className="admin-empty-state" role="status">Loading booking requests…</div> : error ? null : visibleBookings.length ? (
          <div className="admin-table-wrap">
            <table className="admin-room-table admin-wide-table">
              <thead><tr><th>GUEST</th><th>STAY</th><th>DATES / PARTY</th><th>REFERENCE</th><th>RECEIVED</th><th>STATUS</th></tr></thead>
              <tbody>{visibleBookings.map((booking) => (
                <tr key={booking._id}>
                  <td><strong>{booking.guestName}</strong><span className="admin-cell-secondary"><a href={`mailto:${encodeURIComponent(booking.email)}`}>{booking.email}</a></span><span className="admin-cell-secondary"><a href={`tel:${encodeURIComponent(booking.phone)}`}>{booking.phone}</a></span></td>
                  <td><strong>{booking.hotelName}</strong><span className="admin-cell-secondary">{booking.roomName || booking.roomCategory}</span></td>
                  <td>{formatDate(booking.checkIn, { month: "short", day: "numeric" })} – {formatDate(booking.checkOut, { month: "short", day: "numeric", year: "numeric" })}<span className="admin-cell-secondary">{booking.guests} guests</span></td>
                  <td>{booking.reference}</td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td><select className={`admin-status-select ${statusClass(booking.status)}`} value={booking.status} disabled={updating === booking._id} onChange={(event) => updateStatus(booking, event.target.value)} aria-label={`Update status for ${booking.reference}`}>{bookingStatuses.map((status) => <option value={status} key={status}>{bookingStatusLabels[status]}</option>)}</select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="admin-empty-state"><span aria-hidden="true">▣</span><h3>No requests found</h3><p>{bookings.length ? "Try a different search." : "Guest requests will appear here."}</p></div>}
      </section>
    </AdminPageShell>
  );
}

const emptyProperty = {
  name: "", location: "", rating: "0", reviews: "0", price: "0", category: "",
  image: "", imageAlt: "", description: "", address: "", email: "", phone: "",
  website: "", amenities: [], isActive: true
};

function PropertyForm({ initial, onCancel, onSaved }) {
  const [values, setValues] = useState({ ...emptyProperty, ...initial, rating: String(initial?.rating ?? "0"), reviews: String(initial?.reviews ?? 0), price: String(initial?.price ?? 0) });
  const [amenitiesText, setAmenitiesText] = useState((initial?.amenities || []).join("\n"));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initial?.id);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...values,
      rating: Number(values.rating),
      reviews: Number(values.reviews),
      price: Number(values.price),
      amenities: amenitiesText.split("\n").map((item) => item.trim()).filter(Boolean)
    };
    try {
      await adminRequest(editing ? `/properties/${encodeURIComponent(initial.id)}` : "/properties", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      onSaved();
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-property-form admin-form-section" onSubmit={submit}>
      <div className="admin-panel-heading"><div><h2>{editing ? "Edit property details" : "Add a property"}</h2><p>These details are shown in the guest stay catalog.</p></div></div>
      <ErrorNotice error={error} />
      <div className="admin-form-grid">
        <label className="admin-field">Property name<input name="name" value={values.name} onChange={update} placeholder="e.g. The Seaside House" minLength={3} maxLength={100} required /></label>
        <label className="admin-field">Location<input name="location" value={values.location} onChange={update} placeholder="City, region, country" maxLength={160} required /></label>
        <label className="admin-field">Stay category<input name="category" value={values.category} onChange={update} placeholder="e.g. Coastal hideaway" maxLength={80} required /></label>
        <label className="admin-field">Starting price / night<input type="number" name="price" value={values.price} onChange={update} placeholder="0" min="0" max="1000000" step="0.01" required /></label>
        <label className="admin-field">Rating (out of 10)<input type="number" name="rating" value={values.rating} onChange={update} placeholder="9.5" min="0" max="10" step="0.1" required /></label>
        <label className="admin-field">Review count<input type="number" name="reviews" value={values.reviews} onChange={update} placeholder="0" min="0" max="10000000" step="1" required /></label>
        <label className="admin-field admin-field-full">Cover image URL<input type="url" name="image" value={values.image} onChange={update} placeholder="https://example.com/property.jpg" maxLength={2048} required /></label>
        <label className="admin-field admin-field-full">Image description<input name="imageAlt" value={values.imageAlt} onChange={update} placeholder="Describe the property photo" maxLength={240} required /></label>
        <label className="admin-field admin-field-full">Property description<textarea name="description" value={values.description} onChange={update} placeholder="Tell guests what makes this stay special." rows={3} maxLength={2000} /></label>
        <label className="admin-field admin-field-full">Street address<input name="address" value={values.address} onChange={update} placeholder="Street address and postal code" maxLength={240} /></label>
        <label className="admin-field">Contact email<input type="email" name="email" value={values.email} onChange={update} placeholder="stay@example.com" maxLength={254} /></label>
        <label className="admin-field">Contact phone<input type="tel" name="phone" value={values.phone} onChange={update} placeholder="+1 555 0100" maxLength={40} /></label>
        <label className="admin-field admin-field-full">Website URL<input type="url" name="website" value={values.website} onChange={update} placeholder="https://example.com" maxLength={2048} /></label>
        <label className="admin-field admin-field-full">Amenities <small>One per line</small><textarea value={amenitiesText} onChange={(event) => setAmenitiesText(event.target.value)} placeholder={"Free Wi-Fi\nBreakfast\nPool"} rows={4} /></label>
        {editing && <label className="admin-property-active"><input type="checkbox" name="isActive" checked={values.isActive !== false} onChange={update} /> Show this property in the guest catalog</label>}
      </div>
      <div className="admin-form-actions"><button className="admin-secondary-button" type="button" onClick={onCancel}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save property" : "Add property"}</button></div>
    </form>
  );
}

export function PropertyDashboard() {
  const [properties, setProperties] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest("/properties");
      setProperties(result.properties);
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadProperties(); }, [loadProperties]);

  async function archiveProperty(property) {
    if (!window.confirm(`Archive ${property.name}? Its room listings will also be hidden from guests.`)) return;
    setError("");
    try {
      await adminRequest(`/properties/${encodeURIComponent(property.id)}`, { method: "DELETE" });
      await loadProperties();
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    }
  }

  async function saved() {
    setAdding(false);
    setEditing(null);
    await loadProperties();
  }

  return (
    <AdminPageShell active="properties" title="Properties" description="Manage hotel profiles, guest-facing details, and property status." actions={<button className="admin-primary-button" type="button" onClick={() => { setEditing(null); setAdding(true); }}>＋ Add property</button>}>
      <ErrorNotice error={error} onRetry={loadProperties} />
      {(adding || editing) && <PropertyForm key={editing?.id || "new"} initial={editing} onCancel={() => { setAdding(false); setEditing(null); }} onSaved={saved} />}
      <section className="admin-property-grid" aria-label="Properties">
        {loading ? <div className="admin-empty-state" role="status">Loading properties…</div> : error ? null : properties.length ? properties.map((property) => (
          <article className="admin-property-card" key={property.id}>
            <img src={property.image} alt={property.imageAlt} loading="lazy" />
            <div className="admin-property-card-content">
              <div className="admin-property-card-heading"><div><p className="eyebrow">{property.category}</p><h2>{property.name}</h2><p>{property.location}</p></div><span className={`admin-status-pill${property.isActive ? "" : " is-archived"}`}><span />{property.isActive ? "Active" : "Archived"}</span></div>
              <p className="admin-property-description">{property.description || property.imageAlt}</p>
              <div className="admin-property-facts"><span>{property.roomCount} room types</span><span>★ {property.rating} · {property.reviews} reviews</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(property.price)} / night</strong></div>
              {(property.address || property.email || property.phone) && <p className="admin-property-contact">{[property.address, property.email, property.phone].filter(Boolean).join(" · ")}</p>}
              <div className="admin-property-actions"><button type="button" className="admin-secondary-button" onClick={() => { setAdding(false); setEditing(property); }}>Edit details</button><Link href={`/stays/${encodeURIComponent(property.id)}`} target="_blank" rel="noreferrer">Guest page ↗</Link>{property.isActive && <button type="button" className="admin-property-archive" onClick={() => archiveProperty(property)}>Archive</button>}</div>
            </div>
          </article>
        )) : <div className="admin-empty-state"><span aria-hidden="true">⌖</span><h3>No properties yet</h3><p>Add a property to start organizing your stays.</p></div>}
      </section>
    </AdminPageShell>
  );
}

export function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest("/users");
      setUsers(result.users);
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesStatus = statusFilter === "all" || user.accountStatus === statusFilter;
      return matchesStatus && `${user.name} ${user.email}`.toLowerCase().includes(search);
    });
  }, [query, statusFilter, users]);

  async function changeStatus(user) {
    const accountStatus = user.accountStatus === "suspended" ? "active" : "suspended";
    const action = accountStatus === "suspended" ? "suspend" : "reactivate";
    if (!window.confirm(`${action === "suspend" ? "Suspend" : "Reactivate"} ${user.name}'s account? ${accountStatus === "suspended" ? "They will be signed out and unable to sign in." : "They will be able to sign in again."}`)) return;
    setUpdating(user.id);
    setError("");
    try {
      const result = await adminRequest(`/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ accountStatus })
      });
      setUsers((current) => current.map((item) => item.id === user.id ? result.user : item));
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setUpdating("");
    }
  }

  return (
    <AdminPageShell active="users" title="Users & guests" description="Review registered accounts and protect the guest community.">
      <section className="admin-inventory-panel">
        <div className="admin-panel-heading"><div><h2>Guest accounts</h2><p>Latest 250 accounts. Passwords and authentication credentials are never shown here.</p></div><span className="admin-result-count">{error ? "— users" : `${visibleUsers.length} users`}</span></div>
        <div className="admin-table-toolbar">
          <label className="admin-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" aria-label="Search guest accounts" /></label>
          <label className="admin-filter"><span className="visually-hidden">Account status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by account status"><option value="all">All accounts</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
        </div>
        <ErrorNotice error={error} onRetry={loadUsers} />
        {loading ? <div className="admin-empty-state" role="status">Loading guest accounts…</div> : error ? null : visibleUsers.length ? (
          <div className="admin-table-wrap">
            <table className="admin-room-table admin-wide-table">
              <thead><tr><th>GUEST</th><th>JOINED</th><th>LAST UPDATED</th><th>STATUS</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
              <tbody>{visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong><span className="admin-cell-secondary"><a href={`mailto:${encodeURIComponent(user.email)}`}>{user.email}</a></span></td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.updatedAt)}</td>
                  <td><span className={`admin-status-pill${user.accountStatus === "suspended" ? " is-archived" : ""}`}><span />{user.accountStatus}</span></td>
                  <td><button className="admin-user-action" type="button" disabled={updating === user.id || user.isCurrentUser} title={user.isCurrentUser ? "You cannot change your own account status." : ""} onClick={() => changeStatus(user)}>{updating === user.id ? "Saving…" : user.accountStatus === "suspended" ? "Reactivate" : "Suspend"}</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="admin-empty-state"><span aria-hidden="true">♙</span><h3>No guest accounts found</h3><p>{users.length ? "Try another search or status filter." : "New registered accounts will appear here."}</p></div>}
      </section>
    </AdminPageShell>
  );
}
