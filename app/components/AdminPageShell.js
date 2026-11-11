import Link from "next/link";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "⌂", key: "overview" },
  { href: "/dashboard/bookings", label: "Booking requests", icon: "▣", key: "bookings" },
  { href: "/dashboard/properties", label: "Properties", icon: "⌖", key: "properties" },
  { href: "/dashboard/rooms", label: "Rooms & inventory", icon: "▦", key: "rooms" },
  { href: "/dashboard/users", label: "Users & guests", icon: "♙", key: "users" }
];

export default function AdminPageShell({
  active,
  title,
  eyebrow = "PROPERTY WORKSPACE",
  description,
  actions,
  children
}) {
  return (
    <main className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link className="admin-sidebar-brand" href="/dashboard">
            <span className="brand-mark" aria-hidden="true">C</span>
            <span>STAY MANAGEMENT<small>COX&apos;S HOLIDAY STAY</small></span>
          </Link>
          <p className="admin-sidebar-label">WORKSPACE</p>
          <nav aria-label="Management navigation">
            {navigation.map((item) => (
              <Link
                className={active === item.key ? "is-current" : ""}
                href={item.href}
                key={item.key}
                aria-current={active === item.key ? "page" : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-help">
            <span aria-hidden="true">✦</span>
            <strong>Thoughtful stays start here.</strong>
            <p>Keep guest requests and every property detail in good hands.</p>
          </div>
        </aside>
        <section className="admin-main">
          <div className="admin-topline">
            <div><p className="eyebrow">{eyebrow}</p><p className="admin-breadcrumb">Management <span>/</span> {title}</p></div>
            <Link className="admin-view-site" href="/">View website <span aria-hidden="true">↗</span></Link>
          </div>
          <header className="admin-page-heading">
            <div>
              <p className="eyebrow">COX&apos;S HOLIDAY STAY</p>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {actions}
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
