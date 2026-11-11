"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function formatPrice(room) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: room.currency || "USD",
    maximumFractionDigits: 0
  }).format(room.price);
}

export default function RoomAdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/admin/rooms`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Couldn't load the room inventory.");
      setRooms(data.rooms);
    } catch (requestError) {
      setError(requestError.message === "Failed to fetch"
        ? "The management API is unavailable. Check that the server is running."
        : requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const visibleRooms = useMemo(() => rooms.filter((room) => {
    const active = room.isActive !== false;
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" ? active : !active);
    const searchable = `${room.name} ${room.hotelName} ${room.location} ${room.category}`.toLowerCase();
    return matchesStatus && searchable.includes(query.trim().toLowerCase());
  }), [query, rooms, statusFilter]);
  const activeRooms = rooms.filter((room) => room.isActive !== false);
  const totalUnits = activeRooms.reduce((sum, room) => sum + Number(room.roomCount || 0), 0);
  const availableUnits = activeRooms.reduce((sum, room) => sum + Number(room.availableRooms || 0), 0);
  const averageRate = activeRooms.length
    ? Math.round(activeRooms.reduce((sum, room) => sum + Number(room.price || 0), 0) / activeRooms.length)
    : 0;

  async function archiveRoom(room) {
    if (!window.confirm(`Archive ${room.name}? Guests will no longer see it in the room catalog.`)) return;
    try {
      const response = await fetch(`${apiBase}/api/admin/rooms/${encodeURIComponent(room.roomId)}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Couldn't archive this room.");
      await loadRooms();
    } catch (requestError) {
      setError(requestError.message === "Failed to fetch"
        ? "The management API is unavailable. Try again once the server is running."
        : requestError.message);
    }
  }

  return (
    <main className="admin-page">
        <div className="admin-layout">
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
              <strong>Thoughtful stays start here.</strong>
              <p>Keep room details, photos, and policies up to date for every guest.</p>
            </div>
          </aside>

          <section className="admin-main">
            <div className="admin-topline">
              <div><p className="eyebrow">PROPERTY WORKSPACE</p><p className="admin-breadcrumb">Management <span>/</span> Rooms</p></div>
              <Link className="admin-view-site" href="/">View website <span aria-hidden="true">↗</span></Link>
            </div>
            <header className="admin-page-heading">
              <div>
                <p className="eyebrow">YOUR STAYS, BEAUTIFULLY PRESENTED</p>
                <h1>Rooms &amp; inventory</h1>
                <p>Manage room details, rates, availability, and the little things guests need to know.</p>
              </div>
              <Link className="admin-primary-button" href="/dashboard/rooms/new"><span aria-hidden="true">＋</span> Add a room</Link>
            </header>

            <div className="admin-stats-grid">
              <article><span className="admin-stat-icon">▦</span><p>ROOM TYPES</p><strong>{loading || error ? "—" : activeRooms.length}</strong><small>Active listings</small></article>
              <article><span className="admin-stat-icon">⌂</span><p>TOTAL UNITS</p><strong>{loading || error ? "—" : totalUnits}</strong><small>Across active room types</small></article>
              <article><span className="admin-stat-icon">✓</span><p>AVAILABLE NOW</p><strong>{loading || error ? "—" : availableUnits}</strong><small>Units marked available</small></article>
              <article><span className="admin-stat-icon">◇</span><p>AVERAGE NIGHTLY RATE</p><strong>{loading || error ? "—" : formatPrice({ price: averageRate, currency: activeRooms[0]?.currency || "USD" })}</strong><small>Before taxes and fees</small></article>
            </div>

            <section className="admin-inventory-panel">
              <div className="admin-panel-heading">
                <div><h2>Room catalog</h2><p>Every room type and the details guests see.</p></div>
                <span className="admin-result-count">{error ? "— listings" : `${visibleRooms.length} listings`}</span>
              </div>
              <div className="admin-table-toolbar">
                <label className="admin-search">
                  <span aria-hidden="true">⌕</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms or properties" aria-label="Search rooms or properties" />
                </label>
                <label className="admin-filter">
                  <span className="visually-hidden">Listing status</span>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="all">All listings</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>
              {error && (
                <div className="admin-error" role="alert">
                  <div><strong>{error}</strong>{/admin account|room-management access/i.test(error) && <p>Add your signed-in email to the backend <code>ADMIN_EMAILS</code> setting, then restart the API.</p>}{/sign in|session/i.test(error) && <p>Sign in with an email listed in the backend <code>ADMIN_EMAILS</code> setting.</p>}</div>
                  {/sign in|auth|session|account|access/i.test(error)
                    ? <Link href="/login">Sign in <span aria-hidden="true">↗</span></Link>
                    : <button type="button" onClick={loadRooms} disabled={loading}>Try again</button>}
                </div>
              )}
              {loading ? (
                <div className="admin-empty-state" role="status">Loading your room catalog…</div>
              ) : error ? null : visibleRooms.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-room-table">
                    <thead><tr><th>ROOM</th><th>PROPERTY</th><th>CAPACITY</th><th>INVENTORY</th><th>RATE / NIGHT</th><th>STATUS</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                    <tbody>
                      {visibleRooms.map((room) => (
                        <tr key={room.roomId}>
                          <td><div className="admin-room-cell"><img src={room.images?.[0]} alt="" loading="lazy" /><div><strong>{room.name}</strong><span>{room.category} · {room.sizeSqm} m²</span></div></div></td>
                          <td><strong className="admin-property-name">{room.hotelName}</strong><span className="admin-cell-secondary">{room.location}</span></td>
                          <td>{room.capacity} guests</td>
                          <td><strong>{room.availableRooms}</strong><span className="admin-cell-secondary"> of {room.roomCount} units</span></td>
                          <td><strong>{formatPrice(room)}</strong></td>
                          <td><span className={`admin-status-pill${room.isActive === false ? " is-archived" : ""}`}><span />{room.isActive === false ? "Archived" : "Active"}</span></td>
                          <td>
                            <div className="admin-row-actions">
                              <Link href={`/dashboard/rooms/${encodeURIComponent(room.roomId)}/edit`} aria-label={`Edit ${room.name}`}>Edit</Link>
                              {room.isActive !== false && <button type="button" onClick={() => archiveRoom(room)} aria-label={`Archive ${room.name}`}>Archive</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-state">
                  <span aria-hidden="true">⌂</span><h3>No rooms to show</h3>
                  <p>{rooms.length ? "Try a different search or listing status." : "Add your first room type to start building your guest catalog."}</p>
                  {!rooms.length && <Link className="admin-primary-button" href="/dashboard/rooms/new">Add your first room</Link>}
                </div>
              )}
            </section>
          </section>
        </div>
    </main>
  );
}
